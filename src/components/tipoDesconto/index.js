import Toasty from '../toasty';
import Loading from '../loading';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { withRouter } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import ErrorHandler from '../../services/ErrorHandler';
import { TabView, TabPanel } from 'primereact/tabview';
import confirmService from '../../services/confirmService';
import Api, { temQualquerPermissao, getProfile } from '../../services/Api';

import { TipoDesconto } from '../Model';

let url = 'tipoDescontos';
let urlDepartamento = 'departamentos?resumo';
let listaDepartamentos = [];

const check = [
    { label: 'NÃO', value: 'NÃO' },
    { label: 'SIM', value: 'SIM' }
];

const status = [
    { label: 'ATIVO', value: 'ATIVO' },
    { label: 'INATIVO', value: 'INATIVO' }
];

class TipoDescontoView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            lista: [],
            first: 0,
            rows: 5,
            page: 0,
            totalRecords: 0,
            activeIndex: 0,
            status: '',
            descricao: undefined,
            tipoDesconto: new TipoDesconto(),
            departamento: parseInt(getProfile().departamento),
        };

        this.onPage = this.onPage.bind(this);
        this.acoesTabela = this.acoesTabela.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Tipo desconto';
    }

    componentDidMount() {
        setTimeout(() => {
            this.departamentos();
            this.pesquisar();
        }, 300);
    }

    departamentos = async () => {
        await Api({
            method: 'get',
            url: urlDepartamento
        }).then(resp => {
            listaDepartamentos = resp.data.content.map((e) => ({
                value: e.id,
                label: e.nome
            }))
        })
            .catch(error => {
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
                status: this.state.status,
                descricao: this.state.descricao,
                departamento: this.state.departamento
            }
        }).then(resp => {
            Loading.onHide();
            this.setState(
                {
                    first: first,
                    lista: resp.data.content,
                    totalRecords: resp.data.totalElements
                }
            );
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

    salvar = async () => {
        Loading.onShow();

        if (this.state.tipoDesconto.id > 0) {

            await Api({
                method: 'put',
                url: `${url}/${this.state.tipoDesconto.id}`,
                data: JSON.stringify((this.state.tipoDesconto))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Tipo desconto editada com sucesso!');
            })
                .catch(error => {
                    ErrorHandler(error);
                    Loading.onHide();
                });

        } else {
            await Api({
                method: 'post',
                url: `${url}`,
                data: JSON.stringify((this.state.tipoDesconto))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Tipo desconto adicionada com sucesso!');
            })
                .catch(error => {
                    ErrorHandler(error);
                    Loading.onHide();
                });
        }
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

    editar = (value) => {
        const tipoDesconto = {
            id: value.id,
            departamento: {
                id: value.departamento,
            },
            visivel: value.visivel,
            descricao: value.descricao,
            status: value.status,
        };

        this.setState({ activeIndex: 1, tipoDesconto: tipoDesconto });
    }

    inserir = async () => {
        await this.setState({ activeIndex: 1, tipoDesconto: new TipoDesconto() });
        this.setState({ tipoDesconto: { ...this.state.tipoDesconto, departamento: { id: parseInt(getProfile().departamento) } } });
    }

    cancelar = () => {
        this.setState({ activeIndex: 0 });
    }

    onPage(event) {
        this.pesquisar(event.page, event.rows, event.first).then(
            this.setState({ first: event.first, rows: event.rows, page: event.page })
        );
    }

    validDescricao() {
        if (this.state.tipoDesconto.descricao !== null && this.state.tipoDesconto.descricao !== undefined) {
            if (this.state.tipoDesconto.descricao.length > 5) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validDepartamento() {
        if (this.state.tipoDesconto.departamento !== null && this.state.tipoDesconto.departamento !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    validVisivel() {
        if (this.state.tipoDesconto.visivel !== null && this.state.tipoDesconto.visivel !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    validStatus() {
        if (this.state.tipoDesconto.status !== null && this.state.tipoDesconto.status !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    validaFormulario() {
        if (this.validDescricao() && this.validDepartamento() && this.validVisivel() && this.validStatus()) {
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
                onClick={() => { this.editar(rowData) }}
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

    render() {

        var header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>
            Lista de tipo de descontos
        </div>;

        var footer = 'Quantidade de registros ' + this.state.totalRecords;

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
                                                label='Pesquisar'
                                                icon='pi pi-search'
                                                onClick={() => this.pesquisar()}
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
                                                onChange={(e) => this.setState({ status: e.value })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                            <InputText
                                                value={this.state.descricao}
                                                onChange={(e) => this.setState({ descricao: e.target.value.toUpperCase() })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-5'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Departamento</label>
                                            <Dropdown
                                                showClear={true}
                                                options={listaDepartamentos}
                                                value={this.state.departamento}
                                                onChange={(e) => this.setState({ departamento: e.value })}
                                                disabled={!temQualquerPermissao(['ROLE_ADMIN', 'ROLE_RH'])}
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
                                            style={{ marginTop: 15 }}
                                            totalRecords={this.state.totalRecords}
                                            rowsPerPageOptions={[5, 10, 20, 50, 100]}
                                            emptyMessage={'Nenhum registro encontrado!'}
                                        >
                                            <Column field='id' header='Código' style={{ width: '6em' }} />
                                            <Column field='nomeDepartamento' header='Departamento' />
                                            <Column field='descricao' header='Descrição' />
                                            <Column field='visivel' header='Visível' style={{ width: '6em' }} />
                                            <Column field='status' header='Status' style={{ width: '6em' }} />
                                            <Column body={this.acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                        </DataTable>
                                    </div>
                                </TabPanel>
                                <TabPanel disabled header='Cadastro'>
                                    <div className='p-grid'>

                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.tipoDesconto.id}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-10'></div>

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Departamento</label>
                                            <Dropdown
                                                showClear={true}
                                                options={listaDepartamentos}
                                                value={this.state.tipoDesconto.departamento.id}
                                                disabled={!temQualquerPermissao(['ROLE_ADMIN', 'ROLE_RH'])}
                                                onChange={(e) => this.setState({ tipoDesconto: { ...this.state.tipoDesconto, departamento: { id: e.value } } })}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-6'></div>

                                        <div className='p-col-12 p-md-7'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                            <InputText
                                                autoFocus
                                                value={this.state.tipoDesconto.descricao}
                                                onChange={(e) => this.setState({ tipoDesconto: { ...this.state.tipoDesconto, descricao: e.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-5'></div>

                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Visível</label>
                                            <Dropdown
                                                showClear={true}
                                                options={check}
                                                value={this.state.tipoDesconto.visivel}
                                                onChange={(e) => this.setState({ tipoDesconto: { ...this.state.tipoDesconto, visivel: e.value } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Visível</label>
                                            <Dropdown
                                                showClear={true}
                                                options={status}
                                                value={this.state.tipoDesconto.status}
                                                onChange={(e) => this.setState({ tipoDesconto: { ...this.state.tipoDesconto, status: e.value } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-7'>
                                            <Toolbar>
                                                <div className='p-toolbar-group-left'>
                                                    < Button
                                                        label='Salvar'
                                                        icon='pi pi-check'
                                                        onClick={() => this.salvar()}
                                                        disabled={!this.validaFormulario()}
                                                    />
                                                </div>
                                                <div className='p-toolbar-group-right'>
                                                    <Button
                                                        label='Cancelar'
                                                        icon='pi pi-times'
                                                        className='p-button-danger'
                                                        onClick={() => this.cancelar()}
                                                    />
                                                </div>
                                            </Toolbar>
                                        </div>

                                    </div>
                                </TabPanel>
                            </TabView>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(TipoDescontoView);