CREATE TABLE categoria (
                           id BIGSERIAL PRIMARY KEY,
                           nome VARCHAR(80) NOT NULL UNIQUE
);
CREATE TABLE transacao (
                           id BIGSERIAL PRIMARY KEY,
                           tipo CHAR(1) NOT NULL CHECK (tipo IN ('D','R')),
                           data DATE NOT NULL,
                           categoria_id BIGINT NOT NULL REFERENCES categoria(id),
                           forma_pagamento VARCHAR(30) NOT NULL,
                           valor_centavos BIGINT NOT NULL CHECK (valor_centavos > 0),
                           observacao VARCHAR(80)
);
CREATE INDEX idx_transacao_data ON transacao(data);
CREATE TABLE orcamento (
                           id BIGSERIAL PRIMARY KEY,
                           categoria_id BIGINT NOT NULL REFERENCES categoria(id),
                           mes DATE NOT NULL,
                           limite_centavos BIGINT NOT NULL CHECK (limite_centavos > 0),
                           UNIQUE (categoria_id, mes)
);
INSERT INTO categoria (nome) VALUES
                                 ('Alimentação'),('Transporte'),('Moradia'),('Faculdade e educação'),('Saúde'),('Lazer'),
                                 ('Compras pessoais'),('Assinaturas e serviços digitais'),('Contas e serviços'),('Viagens'),('Outros'),('Renda');