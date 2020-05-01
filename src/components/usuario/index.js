import Toasty from '../toasty';
import Loading from '../loading';
import Api from '../../services/Api';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { withRouter } from 'react-router-dom';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import ErrorHandler from '../../services/ErrorHandler';
import { TabView, TabPanel } from 'primereact/tabview';
import confirmService from '../../services/confirmService';

import { Usuario } from '../Model';

let url = 'usuarios';
let departamentos = [];
let permissoes = [];

let status = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'BLOQUEADO', value: 'BLOQUEADO' },
    { label: 'INATIVO', value: 'INATIVO' }
]

class UsuarioView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            page: 0,
            first: 0,
            lista: [],
            visible: false,
            activeIndex: 0,
            totalRecords: 0,
            nome: undefined,
            status: undefined,
            permissao: undefined,
            usuario: new Usuario(),
            departamento: undefined,
        };

        this.onPage = this.onPage.bind(this);
        this.onHide = this.onHide.bind(this);
        this.acoesTabela = this.acoesTabela.bind(this);
        this.acoesTabelaPermissao = this.acoesTabelaPermissao.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Usuário';
    }

    componentDidMount() {
        setTimeout(() => {
            this.pesquisarDepartamento();
            this.pesquisar();
        }, 300);
    }

    pesquisarDepartamento = async () => {
        await Api({
            method: 'get',
            url: 'departamentos'
        }).then(resp => {
            departamentos = resp.data.map((e) => ({
                value: e.id,
                label: e.nome
            }))
        },
            Loading.onHide())
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    pesquisar = async (pagina = 0, rows = this.state.rows, first = 0) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                size: rows,
                page: pagina,
                nome: this.state.nome,
                status: this.state.status,
                departamento: this.state.departamento
            }
        }).then(resp => {
            Loading.onHide();
            this.setState(
                {
                    first: first,
                    lista: resp.data.content,
                    totalRecords: resp.data.totalElements
                });
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    excluir = async (value) => {
        Loading.onShow();

        await Api({
            method: 'delete',
            url: `${url}/${value}`
        }).then(resp => {
            Loading.onHide();
            this.pesquisar();
            Toasty.success('Sucesso!', 'Registro excluído com sucesso!');
        })
            .catch(error => {
                ErrorHandler(error);
                Loading.onHide();
            })
    }

    confirmacaoExcluir = async (value) => {
        await confirmService.show({
            message: `Deseja realmente excluír esse registro (${value}) ?`
        }).then(
            (res) => {

                if (res) {
                    this.excluir(value);
                }
            }
        );
    }

    confirmacaoExcluirPermissao = async (value) => {
        await confirmService.show({
            message: `Deseja realmente excluír esse registro (${value.id}) ?`
        }).then(
            (res) => {

                if (res) {

                    const data = this.state.usuario.permissoes;

                    for (let index = 0; index < data.length; index++) {
                        if (data[index].id === value.id) {
                            const p = data[index];
                            data.splice(data.indexOf(p), 1);
                            this.setState({
                                usuario: { ...this.state.usuario, permissoes: data }
                            })
                        }
                    }
                }
            }
        );
    }

    editar = (value) => {
        this.buscarUsuario(value);
    }

    inserir = () => {
        this.setState({ activeIndex: 1, usuario: new Usuario() });
    }

    onPage(event) {
        this.pesquisar(event.page, event.rows, event.first).then(
            this.setState({ first: event.first, rows: event.rows, page: event.page })
        );
    }

    onHide() {
        this.setState({ visible: false });
    }

    adicionarPermissao = () => {
        if (!!this.state.permissao) {
            for (let index = 0; index < permissoes.length; index++) {
                if (permissoes[index].value === this.state.permissao) {
                    const p = {
                        id: permissoes[index].value,
                        sigla: permissoes[index].sigla,
                        descricao: permissoes[index].label
                    }

                    const x = this.state.usuario.permissoes;

                    x.push(p);

                    this.setState({
                        visible: false,
                        usuario: {
                            ...this.state.usuario, permissoes: x
                        }
                    });
                }
            }
        }
    }

    validaPermissao = () => {
        if (this.state.permissao !== null && this.state.permissao !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    buscarUsuario = async (value) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}/${value}`
        }).then(resp => {
            this.setState({ activeIndex: 1, usuario: resp.data });
            Loading.onHide();
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    editarUsuario = async (value) => {
        Loading.onShow();

        await Api({
            method: 'put',
            url: `${url}/${value}`,
            data: JSON.stringify(this.state.usuario)
        }).then(resp => {
            Loading.onHide();
            this.pesquisar();
            this.setState({ activeIndex: 0 });
            Toasty.success('Sucesso!', 'Usuário editado com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    inserirUsuario = async () => {
        Loading.onShow();

        await Api({
            method: 'post',
            url: url,
            data: JSON.stringify(this.state.usuario)
        }).then(resp => {
            Loading.onHide();
            this.pesquisar();
            this.setState({ activeIndex: 0 });
            Toasty.success('Sucesso!', 'Usuário inserido com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    salvarUsuario = () => {
        if (this.state.usuario.id !== null && this.state.usuario.id !== undefined) {
            this.editarUsuario(this.state.usuario.id);
        } else {
            this.inserirUsuario();
        }
    }

    pesquisaPermissoes = async () => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: 'permissoes'
        }).then(resp => {
            permissoes = resp.data.map((e) => ({
                value: e.id,
                label: e.descricao,
                sigla: e.sigla
            }))
            this.setState({ visible: true, permissao: null });
            Loading.onHide();
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    IsEmail() {
        if (new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(this.state.usuario.email)) {
            return true;
        }
        else {
            return false;
        }
    }

    isID() {
        if (this.state.usuario.id !== null && this.state.usuario.id !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    isSenha() {
        if (this.isID()) {
            if (this.state.usuario.senha !== null && this.state.usuario.senha !== undefined) {
                if (this.state.usuario.senha.length === 8 || this.state.usuario.senha.length === 0) {
                    return true;
                } else {
                    return false;
                }
            } else if (this.state.usuario.senha === undefined) {
                return true;
            } else {
                return false;
            }
        } else {
            if (this.state.usuario.senha !== null && this.state.usuario.senha !== undefined) {
                if (this.state.usuario.senha.length === 8) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    }

    validaFormulario() {
        if ((this.state.usuario.nome !== null && this.state.usuario.nome !== undefined)
            && (this.state.usuario.departamento !== null && this.state.usuario.departamento !== undefined)
            && (this.state.usuario.status !== null && this.state.usuario.status !== undefined)
            && this.isSenha() && this.IsEmail()) {
            return true;
        } else {
            return false;
        }
    }

    acoesTabela(rowData) {
        return <div>
            <Button
                type='button'
                tooltip='Editar'
                icon='pi pi-pencil'
                className='p-button-warning'
                style={{ marginRight: '.5em' }}
                tooltipOptions={{ position: 'top' }}
                onClick={() => this.editar(rowData.id)}
            />
            <Button
                type='button'
                tooltip='Excluir'
                icon='pi pi-trash'
                className='p-button-danger'
                style={{ marginRight: '.5em' }}
                tooltipOptions={{ position: 'top' }}
                onClick={() => this.confirmacaoExcluir(rowData.id)}
            />
        </div>;
    }

    acoesTabelaPermissao(rowData) {
        return <div>
            <Button
                type='button'
                tooltip='Excluir'
                icon='pi pi-trash'
                className='p-button-danger'
                style={{ marginRight: '.5em' }}
                onClick={() => this.confirmacaoExcluirPermissao(rowData)}
            />
        </div>;
    }

    render() {
        var footer = 'Quantidade de registros ' + this.state.totalRecords;

        var header =
            <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>
                Lista de usuários
        </div>;

        var headerPermissao =
            <div className='p-clearfix' style={{ lineHeight: '1.50em' }}>
                Lista de permissões

                <Button
                    label='Add'
                    icon='pi pi-plus'
                    className='p-button-success'
                    tooltip='adicionar permissão'
                    tooltipOptions={{ position: 'top' }}
                    style={{ float: 'right', width: 75 }}
                    onClick={() => this.pesquisaPermissoes()}
                />
            </div>;

        const footerDialog = (
            <div>
                <Button
                    label='Salvar'
                    icon='pi pi-check'
                    disabled={!this.validaPermissao()}
                    onClick={() => this.adicionarPermissao()}
                />

                <Button
                    label='Cancelar'
                    icon='pi pi-times'
                    onClick={this.onHide}
                    className='p-button-danger'
                />
            </div>
        );

        return (
            <div className='p-fluid'>
                <div className='p-grid'>
                    <div className='p-col-12'>
                        <Card>
                            <TabView activeIndex={this.state.activeIndex} onTabChange={(e) => this.setState({ activeIndex: e.index })}>
                                <TabPanel disabled header='Lista'>

                                    <Toolbar>
                                        <div className='p-toolbar-group-left'>
                                            <Button
                                                icon='pi pi-plus'
                                                label='Adicionar'
                                                className='p-button-success'
                                                onClick={() => this.inserir()}
                                            />
                                        </div>
                                        <div className='p-toolbar-group-right'>
                                            <Button
                                                tooltip='Pesquisar'
                                                icon='pi pi-search'
                                                style={{ marginRight: '.25em' }}
                                                onClick={() => this.pesquisar()}
                                                tooltipOptions={{ position: 'top' }}
                                            />

                                            <Button
                                                type='button'
                                                disabled={true}
                                                tooltip='Imprimir'
                                                icon='pi pi-print'
                                                className='p-button-success'
                                                tooltipOptions={{ position: 'top' }}
                                                onClick={() => Toasty.info('', 'Atenção função não definida ainda!')}
                                            />
                                        </div>
                                    </Toolbar>

                                    <div className='p-grid' style={{ marginTop: 10 }}>
                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                            <Dropdown
                                                showClear={true}
                                                options={status}
                                                value={this.state.status}
                                                onChange={(e) => this.setState({ status: e.target.value })}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-9'></div>

                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome</label>
                                            <InputText value={this.state.nome} onChange={(e) => this.setState({ nome: e.target.value.toUpperCase() })} />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-col-12 p-md-8'></div>

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome do departamento</label>
                                            <Dropdown
                                                showClear={true}
                                                options={departamentos}
                                                value={this.state.departamento}
                                                onChange={(e) => this.setState({ departamento: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className='content-section implementation'>
                                        <DataTable
                                            lazy={true}
                                            header={header}
                                            footer={footer}
                                            paginator={true}
                                            responsive={true}
                                            onPage={this.onPage}
                                            rows={this.state.rows}
                                            value={this.state.lista}
                                            first={this.state.first}
                                            style={{ marginTop: 10 }}
                                            totalRecords={this.state.totalRecords}
                                            rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                            emptyMessage={'Nenhum registro encontrado!'}
                                        >
                                            <Column field='id' header='Código' style={{ width: '6em' }} />
                                            <Column field='nome' header='Nome' />
                                            <Column field='email' header='Email' />
                                            <Column field='nomeDepartamento' header='Departamento' />
                                            <Column body={this.acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                        </DataTable>
                                    </div>
                                </TabPanel>
                                <TabPanel disabled header='Cadastro'>
                                    <div className='p-grid'>

                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código</label>
                                            <InputText
                                                readOnly={true}
                                                value={this.state.usuario.id}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-10'></div>

                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Departamento</label>
                                            <Dropdown
                                                showClear={true}
                                                options={departamentos}
                                                value={this.state.usuario.departamento.id}
                                                onChange={(e) => this.setState({ usuario: { ...this.state.usuario, departamento: { id: e.value } } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome</label>
                                            <InputText
                                                value={this.state.usuario.nome}
                                                onChange={(e) => this.setState({ usuario: { ...this.state.usuario, nome: e.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Email</label>
                                            <InputText
                                                value={this.state.usuario.email}
                                                onChange={(e) => this.setState({ usuario: { ...this.state.usuario, email: e.target.value.toLowerCase() } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Senha</label>
                                            <Password
                                                maxLength={8}
                                                keyfilter={/[0-9]+$/}
                                                value={this.state.usuario.senha}
                                                weakLabel={'Atenção a senha digitada é fraca'}
                                                mediumLabel={'Atenção a senha digitada é razoável'}
                                                strongLabel={'Atenção a senha digitada é excelente'}
                                                onChange={(e) => this.setState({ usuario: { ...this.state.usuario, senha: e.target.value } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                            <Dropdown
                                                showClear={true}
                                                options={status}
                                                value={this.state.usuario.status}
                                                onChange={(e) => this.setState({ usuario: { ...this.state.usuario, status: e.value } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data cadastro</label>
                                            <InputText
                                                disabled
                                                value={this.state.usuario.dataCadastro}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Qtd. acessos</label>
                                            <InputText
                                                disabled
                                                value={this.state.usuario.quantidadeAcesso}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Último acesso</label>
                                            <InputText
                                                disabled
                                                value={this.state.usuario.dataUltimoAcesso}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-12'>
                                            <Toolbar>
                                                <div className='p-toolbar-group-left'>
                                                    <Button
                                                        label='Salvar'
                                                        icon='pi pi-check'
                                                        disabled={!this.validaFormulario()}
                                                        onClick={() => this.salvarUsuario()}
                                                    />
                                                </div>
                                                <div className='p-toolbar-group-right'>
                                                    <Button
                                                        label='Cancelar'
                                                        icon='pi pi-times'
                                                        className='p-button-danger'
                                                        onClick={() => this.setState({ activeIndex: 0 })}
                                                    />
                                                </div>
                                            </Toolbar>
                                        </div>

                                        <div className='content-section implementation'>
                                            <DataTable
                                                rows={5}
                                                paginator={true}
                                                responsive={true}
                                                header={headerPermissao}
                                                style={{ marginTop: 10 }}
                                                value={this.state.usuario.permissoes}
                                                rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                                emptyMessage={'Nenhum registro encontrado!'}
                                            >
                                                <Column field='id' header='Código' style={{ textAlign: 'center', width: '8em' }} />
                                                <Column field='descricao' header='Descrição' />
                                                <Column field='sigla' header='Sigla' />
                                                <Column body={this.acoesTabelaPermissao} style={{ textAlign: 'center', width: '4em' }} />
                                            </DataTable>
                                        </div>

                                        <Dialog
                                            closable={false}
                                            header='Lista de permissões'
                                            footer={footerDialog}
                                            visible={this.state.visible}
                                            modal={true}
                                            onHide={this.onHide}
                                            className='dialog'
                                        >
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Permissões</label>
                                            <Dropdown
                                                required
                                                showClear={true}
                                                options={permissoes}
                                                value={this.state.permissao}
                                                onChange={(e) => this.setState({ permissao: e.value })}
                                            />
                                        </Dialog>
                                    </div>
                                </TabPanel>
                            </TabView>
                        </Card>
                    </div>
                </div>
            </div >
        );
    }
}

export default withRouter(UsuarioView);