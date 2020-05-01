import Toasty from '../toasty';
import Loading from '../loading';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { withRouter } from 'react-router-dom';
import { Password } from 'primereact/password';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import Api, { saveFile } from '../../services/Api';
import ErrorHandler from '../../services/ErrorHandler';
import { TabView, TabPanel } from 'primereact/tabview';
import { formatMoney } from '../../services/MaskMoney';
import confirmService from '../../services/confirmService';

import { Funcionario } from '../Model';

let url = 'funcionarios';
let filiais = [];
let empresas = [];

let status = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'BLOQUEADO', value: 'BLOQUEADO' },
    { label: 'INATIVO', value: 'INATIVO' }
]

function Filtro() {
    this.empresa = undefined;
    this.nomeFuncionario = undefined;
    this.cracha = undefined;
    this.status = undefined;
}

class FuncionarioView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            page: 0,
            first: 0,
            lista: [],
            activeIndex: 0,
            totalRecords: 0,
            filtro: new Filtro(),
            funcionario: new Funcionario()
        };

        this.onPage = this.onPage.bind(this);
        this.acoesTabela = this.acoesTabela.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Funcionário';
    }

    componentDidMount() {
        setTimeout(() => {
            this.pesquisar();
            this.pesquisarEmpresas();
        }, 300);
    }

    pesquisarEmpresas = async () => {
        Loading.onShow();

        empresas = [];
        await Api({
            method: 'get',
            url: 'empresas?resumo',
            params: {
                size: 9999
            }
        }).then(resp => {
            Loading.onHide();
            empresas = resp.data.content.map((e) => ({
                value: e.id,
                label: e.nomeEmpresa
            }))
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    pesquisarFiliais = async () => {
        Loading.onShow();

        filiais = [];
        await Api({
            method: 'get',
            url: 'filiais?resumo',
            params: {
                size: 9999
            },
        }).then(resp => {
            Loading.onHide();
            filiais = resp.data.content.map((e) => ({
                value: e.id,
                empresa: e.empresa,
                label: `${e.nomeFilial} - ${e.nomeEmpresa}`
            }))
        })
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
                status: this.state.filtro.status,
                cracha: this.state.filtro.cracha,
                empresa: this.state.filtro.empresa,
                nomeFuncionario: this.state.filtro.nomeFuncionario,
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

    mascaraMoney(value) {
        return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }

    valorDeLimite(value) {
        var numsStr = value.replace(/[^0-9]/g, '');
        return parseInt(numsStr) / 100;
    }

    onChangeFilial = async (e) => {
        await this.setState({ funcionario: { ...this.state.funcionario, filial: { id: e.value } } });

        for (let index = 0; index < filiais.length; index++) {
            if (filiais[index].value === e.value) {
                this.setState({ funcionario: { ...this.state.funcionario, empresa: { id: filiais[index].empresa } } });
            }
        }
    }

    editar = async (value) => {
        await this.pesquisarFiliais();
        await this.buscarFuncionario(value);
        this.setState({ funcionario: { ...this.state.funcionario, valorLimite: this.mascaraMoney(this.state.funcionario.valorLimite) } });
    }

    inserir = async () => {
        await this.pesquisarFiliais();
        await this.setState({ activeIndex: 1, funcionario: new Funcionario() });
        this.setState({ funcionario: { ...this.state.funcionario, valorLimite: this.mascaraMoney(this.state.funcionario.valorLimite) } });
    }

    onPage(event) {
        this.pesquisar(event.page, event.rows, event.first).then(
            this.setState({ first: event.first, rows: event.rows, page: event.page })
        );
    }

    buscarFuncionario = async (value) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}/${value}`
        }).then(resp => {
            Loading.onHide();
            this.setState({ activeIndex: 1, funcionario: resp.data });
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    editarFuncionario = async (value) => {
        Loading.onShow();

        await Api({
            method: 'put',
            url: `${url}/${value}`,
            data: JSON.stringify(this.state.funcionario)
        }).then(resp => {
            Loading.onHide();
            this.pesquisar();
            this.setState({ activeIndex: 0 });
            Toasty.success('Sucesso!', 'Usuário editado com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
                this.setState({ funcionario: { ...this.state.funcionario, valorLimite: this.mascaraMoney(this.state.funcionario.valorLimite) } });
            })
    }

    inserirFuncionario = async () => {
        Loading.onShow();

        await Api({
            method: 'post',
            url: url,
            data: JSON.stringify(this.state.funcionario)
        }).then(resp => {
            Loading.onHide();
            this.pesquisar();
            this.setState({ activeIndex: 0 });
            Toasty.success('Sucesso!', 'Usuário inserido com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
                this.setState({ funcionario: { ...this.state.funcionario, valorLimite: this.mascaraMoney(this.state.funcionario.valorLimite) } });
            })
    }

    exportarXLS = async () => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?XLS`,
            params: this.state.filtro,
            responseType: 'blob',
        }).then(resp => {
            Loading.onHide();
            saveFile(resp.data, 'funcionarios.xls');
            Toasty.success('Sucesso', 'XLS gerado com sucesso!');
        })
            .catch((e) => {
                ErrorHandler(e);
                Loading.onHide();
            })
    }

    salvarFuncionario = async () => {
        await this.setState({ funcionario: { ...this.state.funcionario, valorLimite: this.valorDeLimite(this.state.funcionario.valorLimite) } });

        if (this.state.funcionario.id !== null && this.state.funcionario.id !== undefined) {
            this.editarFuncionario(this.state.funcionario.id);
        } else {
            this.inserirFuncionario();
        }
    }

    IsEmail() {
        if (new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(this.state.funcionario.email)) {
            return true;
        }
        else {
            return false;
        }
    }

    isID() {
        if (this.state.funcionario.id !== null && this.state.funcionario.id !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    isSenha() {
        if (this.isID()) {
            if (this.state.funcionario.senha !== null && this.state.funcionario.senha !== undefined) {
                if (this.state.funcionario.senha.length === 8 || this.state.funcionario.senha.length === 0) {
                    return true;
                } else {
                    return false;
                }
            } else if (this.state.funcionario.senha === undefined) {
                return true;
            } else {
                return false;
            }
        } else {
            if (this.state.funcionario.senha !== null && this.state.funcionario.senha !== undefined) {
                if (this.state.funcionario.senha.length === 8) {
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
        if ((this.state.funcionario.nomeFuncionario !== null && this.state.funcionario.nomeFuncionario !== undefined)
            && (this.state.funcionario.empresa !== null && this.state.funcionario.empresa !== undefined)
            && (this.state.funcionario.status !== null && this.state.funcionario.status !== undefined)
            && (this.state.funcionario.filial !== null && this.state.funcionario.filial !== undefined)
            && (this.state.funcionario.cpf !== null && this.state.funcionario.cpf !== undefined)
            && (this.state.funcionario.valorLimite !== null && this.state.funcionario.valorLimite !== undefined)
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
                tooltipOptions={{position: 'top'}}
                onClick={() => this.editar(rowData.id)}
            />
            <Button
                type='button'
                tooltip='Excluir'
                icon='pi pi-trash'
                className='p-button-danger'
                tooltipOptions={{position: 'top'}}
                onClick={() => this.confirmacaoExcluir(rowData.id)}
            />
        </div>;
    }

    render() {
        var footer = 'Quantidade de registros ' + this.state.totalRecords;

        var header =
            <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>
                Lista de funcionários
        </div>;

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
                                                tooltipOptions={{ position: 'left' }}
                                                onClick={() => this.pesquisar()}
                                            />

                                            <Button
                                                type='button'
                                                tooltip='XLS'
                                                icon='pi pi-external-link'
                                                className='p-button-warning'
                                                disabled={this.state.lista === 0}
                                                onClick={() => this.exportarXLS()}
                                                tooltipOptions={{ position: 'left' }}
                                            />
                                        </div>
                                    </Toolbar>
                                    <div className='p-grid' style={{ marginTop: 10 }}>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                            <Dropdown
                                                showClear={true}
                                                options={status}
                                                value={this.state.filtro.status}
                                                onChange={(e) => this.setState({ filtro: { ...this.state.filtro, status: e.value } })}
                                            />
                                        </div>
                                        <div style={{ padding: 0 }} className='p-md-9'></div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cracha</label>
                                            <InputText
                                                maxLength={7}
                                                keyfilter={/[0-9]+$/}
                                                value={this.state.filtro.cracha}
                                                onChange={(e) => this.setState({ filtro: { ...this.state.filtro, cracha: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome</label>
                                            <InputText
                                                value={this.state.filtro.nomeFuncionario}
                                                onChange={(e) => this.setState({ filtro: { ...this.state.filtro, nomeFuncionario: e.target.value.toUpperCase() } })}
                                            />
                                        </div>
                                        <div style={{ padding: 0 }} className='p-col-12 p-md-6'></div>
                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Empresa</label>
                                            <Dropdown
                                                showClear={true}
                                                options={empresas}
                                                value={this.state.filtro.empresa}
                                                onChange={(e) => this.setState({ filtro: { ...this.state.filtro, empresa: e.value } })}
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
                                            <Column field='cracha' header='Crachá' style={{ width: '7em' }} />
                                            <Column field='nomeFuncionario' header='Nome' />
                                            <Column field='email' header='Email' />
                                            <Column field='status' header='Status' style={{ width: '7em' }} />
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
                                                value={this.state.funcionario.id}
                                            />
                                        </div>
                                        <div style={{ padding: 0 }} className='p-md-10'></div>
                                        <div className='p-col-12 p-md-5'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Filial</label>
                                            <Dropdown
                                                showClear={true}
                                                options={filiais}
                                                value={this.state.funcionario.filial.id}
                                                onChange={(e) => this.onChangeFilial(e)}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Crachá</label>
                                            <InputText
                                                maxLength={7}
                                                keyfilter={/[0-9]+$/}
                                                value={this.state.funcionario.cracha}
                                                onChange={(e) => this.setState({ funcionario: { ...this.state.funcionario, cracha: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>CPF</label>
                                            <InputText
                                                maxLength={14}
                                                keyfilter={/[-.0-9]+$/}
                                                value={this.state.funcionario.cpf}
                                                onChange={(e) => this.setState({ funcionario: { ...this.state.funcionario, cpf: e.target.value.toUpperCase() } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome</label>
                                            <InputText
                                                value={this.state.funcionario.nomeFuncionario}
                                                onChange={(e) => this.setState({ funcionario: { ...this.state.funcionario, nomeFuncionario: e.target.value.toUpperCase() } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-5'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Email</label>
                                            <InputText
                                                value={this.state.funcionario.email}
                                                onChange={(e) => this.setState({ funcionario: { ...this.state.funcionario, email: e.target.value.toLowerCase() } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Senha</label>
                                            <Password
                                                maxLength={8}
                                                keyfilter={/[0-9]+$/}
                                                value={this.state.funcionario.senha}
                                                weakLabel={'Atenção a senha digitada é fraca'}
                                                mediumLabel={'Atenção a senha digitada é razoável'}
                                                strongLabel={'Atenção a senha digitada é excelente'}
                                                onChange={(e) => this.setState({ funcionario: { ...this.state.funcionario, senha: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor limite</label>
                                            <InputText
                                                value={this.state.funcionario.valorLimite}
                                                onChange={(e) => this.setState({ funcionario: { ...this.state.funcionario, valorLimite: formatMoney(e.target.value) } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                            <Dropdown
                                                dataKey='value'
                                                showClear={true}
                                                options={status}
                                                value={this.state.funcionario.status}
                                                onChange={(e) => this.setState({ funcionario: { ...this.state.funcionario, status: e.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data cadastro</label>
                                            <InputText
                                                disabled
                                                value={this.state.funcionario.dataCadastro}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Qtd. acessos</label>
                                            <InputText
                                                disabled
                                                value={this.state.funcionario.quantidadeAcesso}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Último acesso</label>
                                            <InputText
                                                disabled
                                                value={this.state.funcionario.dataUltimoAcesso}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-12'>
                                            <Toolbar>
                                                <div className='p-toolbar-group-left'>
                                                    <Button
                                                        label='Salvar'
                                                        icon='pi pi-check'
                                                        disabled={!this.validaFormulario()}
                                                        onClick={() => this.salvarFuncionario()}
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
                                    </div>
                                </TabPanel>
                            </TabView>
                        </Card>
                    </div>
                </div >
            </div >
        );
    }
}

export default withRouter(FuncionarioView);