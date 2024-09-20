-- CreateTable
CREATE TABLE `Agrupamento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(225) NULL,


    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parque` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NULL,
    `agrupamento` INTEGER NULL,


    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Categoria` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NULL,


    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Empresa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(45) NULL,
    `nome` VARCHAR(45) NULL,


    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Coleta` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `empresa` INTEGER NULL,
    `data_coleta` DATETIME(3) NULL,
    `hora_coleta` DATETIME(3) NULL,
    `data_viagem` DATETIME(3) NULL,
    `parque` INTEGER NULL,
    `preco_parcelado` DOUBLE NULL,
    `preco_avista` DOUBLE NULL,
    `margem` DOUBLE NULL,
    `margem_cat` DOUBLE NULL,
    `categoria` INTEGER NULL,
    `data_registro` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `data_atualizacao` DATETIME(3) NULL,
    `atualizado_por` VARCHAR(45) NULL,


    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Combos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(255) NULL,


    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CombosProdutos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `produto` INTEGER NOT NULL,
    `combo` INTEGER NOT NULL,


    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Parque`
ADD CONSTRAINT `Parque_agrupamento_fkey` FOREIGN KEY (`agrupamento`) REFERENCES `Agrupamento` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coleta`
ADD CONSTRAINT `Coleta_empresa_fkey` FOREIGN KEY (`empresa`) REFERENCES `Empresa` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coleta`
ADD CONSTRAINT `Coleta_parque_fkey` FOREIGN KEY (`parque`) REFERENCES `Parque` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Coleta`
ADD CONSTRAINT `Coleta_categoria_fkey` FOREIGN KEY (`categoria`) REFERENCES `Categoria` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CombosProdutos`
ADD CONSTRAINT `CombosProdutos_produto_fkey` FOREIGN KEY (`produto`) REFERENCES `Parque` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CombosProdutos`
ADD CONSTRAINT `CombosProdutos_combo_fkey` FOREIGN KEY (`combo`) REFERENCES `Combos` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;