export function Permissao() {
    this.id = undefined;
    this.descricao = undefined;
    this.sigla = undefined;
}

export function Departamento() {
    this.id = undefined;
    this.nome = undefined;
}

export function Usuario() {
    this.id = undefined;
    this.departamento = new Departamento();
    this.nome = undefined;
    this.email = '';
    this.senha = '';
    this.status = 'ATIVO';
    this.quantidadeAcesso = 0;
    this.dataUltimoAcesso = undefined;
    this.dataCadastro = undefined;
    this.permissoes = [];
}

export function PerfilUsuario() {
    this.id = undefined;
    this.departamento = undefined;
    this.nome = undefined;
    this.email = undefined;
    this.senhaAntiga = undefined;
    this.senhaNova = undefined;
    this.status = undefined;
    this.quantidadeAcesso = undefined;
    this.dataUltimoAcesso = undefined;
    this.dataCadastro = undefined;
    this.permissoes = [];
}

export function Empresa() {
    this.id = undefined;
    this.cnpj = undefined;
    this.nomeAssociacao = undefined;
    this.nomeEmpresa = undefined;
    this.nomeFantasia = undefined;
}

export function Filial() {
    this.id = undefined;
    this.empresa = new Empresa();
    this.codigo = undefined;
    this.nome = undefined;
    this.cidade = undefined;
}

export function Periodo() {
    this.id = undefined;
    this.descricao = undefined;
    this.mes = undefined;
    this.ano = undefined;
    this.dataInicio = undefined;
    this.dataFim = undefined;
    this.situacao = 'ABERTO';
}

export function Evento() {
    this.id = undefined;
    this.empresa = new Empresa();
    this.codigo = undefined;
    this.descricao = undefined;
}

export function EventoResumo() {
    this.id = undefined;
    this.empresa = undefined;
    this.nomeEmpresa = undefined;
    this.codigo = undefined;
    this.descricao = undefined;
}

export function EventoFilter() {
    this.id = undefined;
    this.empresa = undefined;
    this.codigo = undefined;
    this.descricao = undefined;
}

export function TipoDesconto() {
    this.id = undefined;
    this.departamento = new Departamento();
    this.descricao = undefined;
    this.visivel = 'NÃO';
    this.status = 'ATIVO';
}

export function TipoDescontoResumo() {
    this.id = undefined;
    this.departamento = undefined;
    this.nomeDepartamento = undefined;
    this.descricao = undefined;
}

export function NotaFilter() {
    this.dataDe = undefined;
    this.dataAte = undefined;
    this.empresa = undefined;
    this.usuario = undefined;
    this.departamento = undefined;
    this.evento = undefined;
    this.periodo = undefined;
    this.tipoDesconto = undefined;
    this.nomeFuncionario = undefined;
    this.cracha = undefined;
    this.notas = []
}

export function ManipulaNota() {
    this.empresa = undefined;
    this.tipo = undefined;
    this.evento = undefined;
    this.tipoDesconto = undefined;
    this.periodo = undefined;
    this.parcela = 1;
    this.funcionario = undefined;
    this.usuario = undefined;
    this.valor = undefined;
    this.senha = undefined;
    this.mensagem = undefined;
}

export function CodigoRetornoNota() {
    this.id = undefined;
    this.descricao = undefined;
}

export function Funcionario() {
    this.id = undefined;
    this.empresa = new Empresa();
    this.filial = new Filial();
    this.nomeFuncionario = undefined;
    this.cpf = undefined;
    this.cracha = undefined;
    this.email = undefined;
    this.senha = undefined;
    this.status = 'ATIVO';
    this.valorLimite = 0;
    this.quantidadeFalhaLogin = 0;
    this.quantidadeAcesso = 0;
    this.dataUltimoAcesso = undefined;
    this.dataCadastro = undefined;
}

export function Nota() {
    this.id = undefined;
    this.empresa = new Empresa();
    this.departamento = new Departamento();
    this.tipoDesconto = new TipoDesconto();
    this.evento = new Evento();
    this.periodo = new Periodo();
    this.funcionario = new Funcionario();
    this.usuario = new Usuario();
    this.dataNota = new Date();
    this.numeroParcela = 'PARCELA 1/1';
    this.valorNota = 0;
    this.quantidadeFalhaDigitarSenha = 1;
    this.codigoRetornoNota = new CodigoRetornoNota();
    this.dataAutenticacao = undefined;
}

export function Seguro() {
    this.id = undefined;
    this.funcionario = new Funcionario();
    this.valor = 0;
}
