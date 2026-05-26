-- Migracao manual para habilitar controle de planos comerciais.
-- Aplicar em homologacao/producao antes de subir com spring.jpa.hibernate.ddl-auto=validate.

ALTER TABLE empresa
    ADD COLUMN IF NOT EXISTS plano_comercial VARCHAR(30) NOT NULL DEFAULT 'STARTER',
    ADD COLUMN IF NOT EXISTS status_assinatura VARCHAR(30) NOT NULL DEFAULT 'TESTE',
    ADD COLUMN IF NOT EXISTS limite_usuarios INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS limite_filiais INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS limite_caixas INTEGER DEFAULT 1,
    ADD COLUMN IF NOT EXISTS limite_produtos INTEGER DEFAULT 500,
    ADD COLUMN IF NOT EXISTS valor_mensal_plano NUMERIC(12, 2),
    ADD COLUMN IF NOT EXISTS dia_vencimento_plano INTEGER DEFAULT 10,
    ADD COLUMN IF NOT EXISTS ultimo_pagamento_plano DATE,
    ADD COLUMN IF NOT EXISTS fiscal_liberado BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS pagamentos_liberado BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS notificacoes_liberado BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS logistica_liberada BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS servicos_liberado BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS auditoria_avancada_liberada BOOLEAN DEFAULT FALSE;

UPDATE empresa
SET
    plano_comercial = COALESCE(plano_comercial, 'STARTER'),
    status_assinatura = COALESCE(status_assinatura, 'TESTE'),
    limite_usuarios = COALESCE(limite_usuarios, 3),
    limite_filiais = COALESCE(limite_filiais, 1),
    limite_caixas = COALESCE(limite_caixas, 1),
    limite_produtos = COALESCE(limite_produtos, 500),
    dia_vencimento_plano = COALESCE(dia_vencimento_plano, 10),
    fiscal_liberado = COALESCE(fiscal_liberado, FALSE),
    pagamentos_liberado = COALESCE(pagamentos_liberado, FALSE),
    notificacoes_liberado = COALESCE(notificacoes_liberado, FALSE),
    logistica_liberada = COALESCE(logistica_liberada, FALSE),
    servicos_liberado = COALESCE(servicos_liberado, FALSE),
    auditoria_avancada_liberada = COALESCE(auditoria_avancada_liberada, FALSE);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_empresa_plano_comercial') THEN
        ALTER TABLE empresa ADD CONSTRAINT chk_empresa_plano_comercial
            CHECK (plano_comercial IN ('STARTER', 'BUSINESS', 'ENTERPRISE'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_empresa_status_assinatura') THEN
        ALTER TABLE empresa ADD CONSTRAINT chk_empresa_status_assinatura
            CHECK (status_assinatura IN ('TESTE', 'ATIVA', 'PENDENTE', 'SUSPENSA', 'CANCELADA'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_empresa_limite_usuarios') THEN
        ALTER TABLE empresa ADD CONSTRAINT chk_empresa_limite_usuarios
            CHECK (limite_usuarios IS NULL OR limite_usuarios >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_empresa_limite_filiais') THEN
        ALTER TABLE empresa ADD CONSTRAINT chk_empresa_limite_filiais
            CHECK (limite_filiais IS NULL OR limite_filiais >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_empresa_limite_caixas') THEN
        ALTER TABLE empresa ADD CONSTRAINT chk_empresa_limite_caixas
            CHECK (limite_caixas IS NULL OR limite_caixas >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_empresa_limite_produtos') THEN
        ALTER TABLE empresa ADD CONSTRAINT chk_empresa_limite_produtos
            CHECK (limite_produtos IS NULL OR limite_produtos >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_empresa_valor_mensal_plano') THEN
        ALTER TABLE empresa ADD CONSTRAINT chk_empresa_valor_mensal_plano
            CHECK (valor_mensal_plano IS NULL OR valor_mensal_plano >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_empresa_dia_vencimento_plano') THEN
        ALTER TABLE empresa ADD CONSTRAINT chk_empresa_dia_vencimento_plano
            CHECK (dia_vencimento_plano IS NULL OR dia_vencimento_plano BETWEEN 1 AND 28);
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS liberacao_modulo_empresa (
    id UUID PRIMARY KEY,
    empresa_id UUID NOT NULL,
    modulo VARCHAR(40) NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'BLOQUEADO',
    contratado BOOLEAN NOT NULL DEFAULT FALSE,
    liberado BOOLEAN NOT NULL DEFAULT FALSE,
    responsavel VARCHAR(120),
    evidencia VARCHAR(255),
    observacao TEXT,
    data_liberacao TIMESTAMP,
    data_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_liberacao_modulo_empresa UNIQUE (empresa_id, modulo),
    CONSTRAINT fk_liberacao_modulo_empresa_empresa FOREIGN KEY (empresa_id) REFERENCES empresa(id),
    CONSTRAINT chk_liberacao_modulo_empresa_modulo CHECK (
        modulo IN ('FISCAL', 'PAGAMENTOS', 'NOTIFICACOES', 'LOGISTICA', 'SERVICOS', 'AUDITORIA')
    ),
    CONSTRAINT chk_liberacao_modulo_empresa_status CHECK (
        status IN ('BLOQUEADO', 'CONTRATADO', 'PENDENTE_HOMOLOGACAO', 'HOMOLOGADO', 'LIBERADO_PRODUCAO', 'SUSPENSO')
    )
);

-- Bootstrap opcional para liberar a tela de planos a um responsavel tecnico.
-- Troque o login antes de executar. O campo usa lista separada por virgula.
--
-- UPDATE usuario
-- SET permissoes_extras = CASE
--     WHEN permissoes_extras IS NULL OR permissoes_extras = '' THEN 'action:managePlans'
--     WHEN permissoes_extras NOT LIKE '%action:managePlans%' THEN permissoes_extras || ',action:managePlans'
--     ELSE permissoes_extras
-- END
-- WHERE login = 'admin';
