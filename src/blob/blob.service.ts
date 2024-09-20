import { Injectable, Logger } from '@nestjs/common';
import { BlobServiceClient } from '@azure/storage-blob';
import * as path from 'path';
import * as fs from 'fs';
import * as jsonfile from 'jsonfile';

@Injectable()
export class AzureBlobStorageService {
  private readonly logger = new Logger(AzureBlobStorageService.name);
  private blobServiceClient: BlobServiceClient;
  private containerClient: any;

  constructor() {
    const connect_str =
      'DefaultEndpointsProtocol=https;AccountName=sdarq;AccountKey=1WFQXUd7f2vQwRLa2EZod7EtrtyE7HmlKZwBWfby5EuAPy2TvFgM/XSfyG5SzqxIQriIYLpqgMNrEANpCIP0cA==;EndpointSuffix=core.windows.net'; // Substitua pela sua string de conexão
    const containerName = 'imagens/Automacao_python'; // Nome do container

    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connect_str);
    this.containerClient =
      this.blobServiceClient.getContainerClient(containerName);
  }

  async baixarBlobSeExistir(
    nomeArquivoJson: string,
    pasta: string,
  ): Promise<void> {
    const blobClient = this.containerClient.getBlobClient(
      path.join(pasta, nomeArquivoJson),
    );

    if (await blobClient.exists()) {
      await blobClient.downloadToFile(nomeArquivoJson);
      this.logger.log(`Arquivo ${nomeArquivoJson} baixado com sucesso.`);
    } else {
      this.logger.warn(
        `Arquivo ${nomeArquivoJson} não existe no Blob Storage.`,
      );
    }
  }

  async uploadBlob(
    caminhoArquivoJson: any,
    nomeArquivoJson: string,
    pasta: string,
  ): Promise<void> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(
      path.join(pasta, nomeArquivoJson),
    );

    const data = fs.readFileSync(caminhoArquivoJson);
    await blockBlobClient.upload(data, data.length, { overwrite: true });
    this.logger.log(
      `Arquivo ${nomeArquivoJson} enviado com sucesso para ${pasta}.`,
    );
  }

  carregarDadosJson(nomeArquivo: string): any[] {
    let dados = [];
    if (!fs.existsSync(nomeArquivo) || fs.statSync(nomeArquivo).size === 0) {
      fs.writeFileSync(nomeArquivo, JSON.stringify([]));
    } else {
      dados = jsonfile.readFileSync(nomeArquivo);
    }
    return dados;
  }

  async salvarDados(
    df: any,
    nomeArquivoJson: string,
    pasta: string,
    hour: string,
  ): Promise<void> {
    const novosDados = df.toJSON();
    const novoRegistro = { Hora_coleta: hour, Dados: novosDados };

    await this.baixarBlobSeExistir(nomeArquivoJson, pasta);
    const dadosExist = this.carregarDadosJson(nomeArquivoJson);
    dadosExist.push(novoRegistro);

    fs.writeFileSync(nomeArquivoJson, JSON.stringify(dadosExist, null, 4));
    await this.uploadBlob(nomeArquivoJson, nomeArquivoJson, pasta);
  }

  async salvarDadosLead(
    df: any,
    nomeArquivoJson: string,
    pasta: string,
  ): Promise<void> {
    await this.baixarBlobSeExistir(nomeArquivoJson, pasta);
    const dadosExist = this.carregarDadosJson(nomeArquivoJson);
    dadosExist.push(df);

    fs.writeFileSync(nomeArquivoJson, JSON.stringify(dadosExist, null, 4));
    await this.uploadBlob(nomeArquivoJson, nomeArquivoJson, pasta);

    // Apagar o JSON da pasta atual
    fs.unlinkSync(nomeArquivoJson);
  }

  async salvarDadosMargem(
    df: any,
    nomeArquivoJson: string,
    pasta: string,
  ): Promise<void> {
    const jsonData = df.toJSON();
    const blockBlobClient = this.containerClient.getBlockBlobClient(
      path.join(pasta, nomeArquivoJson),
    );

    await blockBlobClient.upload(
      JSON.stringify(jsonData),
      Buffer.byteLength(JSON.stringify(jsonData)),
      { overwrite: true },
    );
    this.logger.log(
      `Arquivo ${nomeArquivoJson} enviado com sucesso para ${pasta}.`,
    );
  }
}
