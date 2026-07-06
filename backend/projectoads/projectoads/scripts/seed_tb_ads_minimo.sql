-- Carga inicial minima para ambiente local do Nexus Gestao Pro.
-- Execute somente em banco de desenvolvimento/homologacao.
-- O usuario master tambem e criado automaticamente pelo MasterBootstrapConfig ao subir a aplicacao.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO empresa (
    id,
    nome,
    razao_social,
    plano_comercial,
    status_assinatura,
    limite_usuarios,
    limite_filiais,
    limite_caixas,
    limite_produtos,
    dia_vencimento_plano,
    fiscal_liberado,
    pagamentos_liberado,
    notificacoes_liberado,
    logistica_liberada,
    servicos_liberado,
    auditoria_avancada_liberada,
    ativo,
    data_cadastro
)
SELECT
    gen_random_uuid(),
    'Nexus Gestao Pro',
    'Nexus Gestao Pro',
    'STARTER',
    'TESTE',
    3,
    1,
    1,
    500,
    10,
    false,
    false,
    false,
    false,
    false,
    false,
    true,
    now()
WHERE NOT EXISTS (
    SELECT 1
    FROM empresa
    WHERE nome = 'Nexus Gestao Pro'
);

-- Para usuario master, prefira subir a aplicacao. O bootstrap cria:
-- login: master
-- senha inicial: 0123456
-- perfil: MASTER
