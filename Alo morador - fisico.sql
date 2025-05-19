create table pessoa_morador (
	id_morador serial not null,
	nome_completo varchar(50) not null,
	rg char(15) not null,
	cpf varchar(11) not null,
	telefone_celular varchar(11),
	data_nascimento date,
	numero_apto char(3),
	id_bloco integer not null,
	
	-- primary key
	constraint pk_pm_id_morador primary key (id_morador),
	
	-- foreign key 
	constraint fk_blc_id_bloco foreign key (id_bloco) references bloco (id_bloco)
	
);
----------------------------------------------------------------
create table bloco (
	id_bloco serial not null,
	nome varchar(10),
	
	-- primary key
	constraint pk_blc_id_bloco primary key (id_bloco)

);
----------------------------------------------------------------
create table login_morador (
	usuario_idusuario serial not null,
	id_morador integer not null,
	
	-- primary key
	constraint pk_log_usuario_idusuario primary key (usuario_idusuario),
	
	-- foreign key 
	constraint fk_pm_id_morador foreign key (id_morador) references pessoa_morador (id_morador)
	
);
----------------------------------------------------------------
create table pessoa_visitante (
	id_visitante serial not null,
	nome_completo varchar(50) not null,
	rg char(15) not null,
	cpf varchar(11) not null,
	
	-- primary key
	constraint pk_pv_id_visitante primary key (id_visitante)
	
);
----------------------------------------------------------------
create table visita (
	id_visita serial not null,
	usuario_idusuario integer not null,
	id_visitante integer not null,
	data_hora date not null,
	
	constraint pk_vist_id_visita primary key (id_visita),
	constraint fk_vist_usuario_idusuario foreign key (usuario_idusuario) references login_morador (usuario_idusuario),
	constraint fk_vist_id_visitante foreign key (id_visitante) references pessoa_visitante (id_visitante)
	
);
----------------------------------------------------------------
create table pessoa_funcionario (
	id_funcionario serial not null,
	nome_completo varchar(50) not null,
	rg char(15) not null,
	cpf varchar(11) not null,
	
	constraint pk_pf_id_funcionario primary key (id_funcionario)
	
);
----------------------------------------------------------------
create table login_funcionario (
	usuario_idfuncionario serial not null,
	id_funcionario integer not null,
	
	-- primary key
	constraint pk_logf_usuario_idfuncionario primary key (usuario_idfuncionario),
	
	-- foreign key 
	constraint fk_logf_id_funcionario foreign key (id_funcionario) references pessoa_funcionario (id_funcionario)
	
);
----------------------------------------------------------------
create table encomenda (
	id_encomenda serial not null,
	usuario_idusuario integer not null,
	data_hora_recebimento TIMESTAMP,
	
	-- primary key
	constraint pk_encmd_id_encomenda primary key (id_encomenda),
	
	-- foreign key 
	constraint fk_log_usuario_idusuario foreign key (usuario_idusuario) references login_morador (usuario_idusuario)
	
);
----------------------------------------------------------------
create table tipo_reserva (
	id_tipo serial not null,
	tipo_reserva varchar(20 )not null,
	
	-- primary key
	constraint pk_tiporsrv_id_tipo primary key (id_tipo)
	
);
----------------------------------------------------------------
create table reserva (
	id_reserva serial not null,
	id_tipo integer not null,
	data date not null,
	usuario_idusuario integer not null,
	
	-- primary key
	constraint pk_rsrv_id_reserva primary key (id_reserva),
	
	-- foreign key 
	constraint fk_tiporsrv_id_tipo foreign key (id_tipo) references tipo_reserva (id_tipo),
	constraint fk_log_usuario_idusuario foreign key (usuario_idusuario) references login_morador (usuario_idusuario)

);
----------------------------------------------------------------
create table tipo_reclamacao (
	id_tipo_reclamacao serial not null,
	descricao varchar(20) not null,
	
	-- primary key
	constraint pk_tprclm_id_tipo primary key (id_tipo_reclamacao)
	
);
----------------------------------------------------------------
create table reclamacao (
	id_reclamacao serial not null,
	id_tipo_reclamacao integer not null,
	descricao_reclamacao varchar(200) not null,
	
	-- primary key
	constraint pk_rclm_id_reclamacao primary key (id_reclamacao),
	
	-- foreign key 
	constraint fk_tiporclm_id_tipo_reclamacao foreign key (id_tipo_reclamacao) references tipo_reclamacao (id_tipo_reclamacao)
);
----------------------------------------------------------------
create table reclamacao_resposta (
	id_resposta serial not null, 
	usuario_idfuncionario integer not null,
	id_reclamacao integer not null,
	resposta varchar(200) not null,
	
	-- primary key
	constraint pk_rclmrspt_id_resposta primary key (id_resposta),
	
	-- foreign key 
	constraint fk_rclmrspt_usuario_idfuncionario foreign key (usuario_idfuncionario) references login_funcionario (usuario_idfuncionario),
	constraint fk_rclmrspt_id_reclamacao foreign key (id_reclamacao) references reclamacao (id_reclamacao)
);
----------------------------------------------------------------
create table tipo_pagamento (
	id_tipo_pagamento serial not null, 
	descricao varchar(20) not null,
	
	-- primary key
	constraint pk_tipopgto_id_tipo_pagamento primary key (id_tipo_pagamento)
);
----------------------------------------------------------------
create table pagamento (
	id_pagamento serial not null, 
	valor_pagamento integer not null,
	juros_dia integer not null,
	data_pagamento date,
	id_tipo_pagamento integer not null,
	
	-- primary key
	constraint pk_pgto_id_pagamento primary key (id_pagamento),
	
	-- foreign key 
	constraint fk_pndncs_id_tipo_pagamento foreign key (id_tipo_pagamento) references tipo_pagamento (id_tipo_pagamento)
);
----------------------------------------------------------------
create table pendencias (
	id_pendencia serial not null, 
	usuario_idusuario integer not null,
	id_pagamento integer not null,
	data_pagamento date,
	descricao varchar(20) not null,
	
	-- primary key
	constraint pk_pndncs_id_pendencia primary key (id_pendencia),
	
	-- foreign key 
	constraint fk_pndncs_usuario_idusuario foreign key (usuario_idusuario) references login_morador (usuario_idusuario),
	constraint fk_pndncs_id_pagamento foreign key (id_pagamento) references pagamento (id_pagamento)
);
----------------------------------------------------------------
create table multa (
	id_multa serial not null, 
	data_multa date,
	valor_multa integer not null,
	id_pendencia integer not null,
	
	-- primary key
	constraint pk_multa_id_multa primary key (id_multa),
	
	-- foreign key 
	constraint fk_pndncs_id_pendencia foreign key (id_pendencia) references pendencias (id_pendencia)
);
----------------------------------------------------------------

create table comunidade (
	id_post serial not null,
	postagem varchar(200),
	usuario_idusuario integer not null,
	
	constraint pk_comuni_id_post primary key (id_post),
	constraint fk_logusuario_usuario_idusuario foreign key (usuario_idusuario) references login_morador (usuario_idusuario)

	
);

create table comunidade_comentario (
	id_comentario serial not null,
	id_post integer not null,
	usuario_idusuario integer not null,
	
	
	constraint pk_comunicoment_id_comentario primary key (id_comentario),
	constraint fk_logusuario_usuario_idusuario foreign key (usuario_idusuario) references login_morador (usuario_idusuario)

	
);
