import Toasty from '../toasty';
import Loading from '../loading';
import Api from '../../services/Api';
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

import { Filial } from '../Model';

let url = 'filiais';
let urlEmpresa = 'empresas';
let listaEmpresas = [];

class FilialView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            page: 0,
            first: 0,
            lista: [],
            activeIndex: 0,
            totalRecords: 0,
            empresa: undefined,
            filial: new Filial(),
            nomeFilial: undefined,
        };

        this.onPage = this.onPage.bind(this);
        this.acoesTabela = this.acoesTabela.bind(this);
        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Filial';
    }

    componentDidMount() {
        setTimeout(() => {
            this.empresas();
            this.pesquisar();
        }, 300);
    }

    onChangeEmpresa = (e) => {
        this.setState({ empresa: e.value });
    }

    onChangeEmpresaFilial = (e) => {
        this.setState({
            filial: {
                ...this.state.filial, empresa: {
                    id: e.value
                }
            }
        });
    }

    empresas = async () => {
        await Api({
            method: 'get',
            url: urlEmpresa
        }).then(resp => {
            listaEmpresas = resp.data.map((e) => ({
                value: e.id,
                label: e.nomeEmpresa
            }))
        })
            .catch(error => {
                ErrorHandler(error);
            })
    }

    onPage(event) {
        this.pesquisar(event.page, event.rows, event.first).then(
            this.setState({ first: event.first, rows: event.rows, page: event.page })
        );
    }

    pesquisar = async (pagina = 0, rows = this.state.rows, first = 0) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                size: rows,
                page: pagina,
                empresa: this.state.empresa,
                nomeFilial: this.state.nomeFilial
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

        if (this.state.filial.id > 0) {

            await Api({
                method: 'put',
                url: `${url}/${this.state.filial.id}`,
                data: JSON.stringify((this.state.filial))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Filial editada com sucesso!');
            })
                .catch(error => {
                    ErrorHandler(error);
                    Loading.onHide();
                });

        } else {
            await Api({
                method: 'post',
                url: `${url}`,
                data: JSON.stringify((this.state.filial))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Filial adicionada com sucesso!');
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
        this.setState({
            activeIndex: 1, filial: {
                id: value.id,
                empresa: {
                    id: value.empresa
                },
                codigo: value.codigo,
                nome: value.nomeFilial,
                cidade: value.cidade
            }
        });
    }

    inserir = () => {
        this.setState({ activeIndex: 1, filial: new Filial() });
    }

    cancelar = () => {
        this.setState({ activeIndex: 0 });
    }

    validCodigo() {
        if ((this.state.filial.codigo !== undefined) && (this.state.filial.codigo !== null)) {
            if (this.state.filial.codigo.length > 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validNome() {
        if ((this.state.filial.nome !== undefined) && (this.state.filial.nome !== null)) {
            if (this.state.filial.nome.length > 3) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validCidade() {
        if ((this.state.filial.cidade !== undefined) && (this.state.filial.cidade !== null)) {
            if (this.state.filial.cidade.length > 3) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validEmpresa() {
        if ((this.state.filial.empresa !== undefined) && (this.state.filial.empresa !== null)) {
            return true;
        } else {
            return false;
        }
    }

    validaFormulario() {
        if (this.validCodigo() && this.validNome() && this.validCidade() && this.validEmpresa()) {
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
                onClick={() => this.editar(rowData)}
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

        var header =
            <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>
                Lista de filiais
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

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Empresa</label>
                                            <Dropdown
                                                showClear={true}
                                                options={listaEmpresas}
                                                value={this.state.empresa}
                                                onChange={(e) => this.onChangeEmpresa(e)}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome do filial</label>
                                            <InputText
                                                value={this.state.nomeFilial}
                                                onChange={(e) => this.setState({ nomeFilial: e.target.value.toUpperCase() })}
                                            />
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
                                                <Column field='codigo' header='Número' style={{ width: '6em' }} />
                                                <Column field='nomeEmpresa' header='Empresa' />
                                                <Column field='nomeFilial' header='Nome Filial' style={{ width: '12em' }} />
                                                <Column field='cidade' header='Cidade' style={{ width: '10em' }} />
                                                <Column body={this.acoesTabela} style={{ textAlign: 'center', width: '8em' }} />
                                            </DataTable>
                                        </div>

                                    </div>
                                </TabPanel>

                                <TabPanel disabled header='Cadastro'>
                                    <div className='p-grid'>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.filial.id}
                                            />
                                        </div>

                                        <div className='p-md-10' style={{ padding: 0 }}></div>

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Empresa</label>
                                            <Dropdown
                                                showClear={true}
                                                options={listaEmpresas}
                                                value={this.state.filial.empresa.id}
                                                onChange={(e) => this.setState({ filial: { ...this.state.filial, empresa: { id: e.value } } })}
                                            />
                                        </div>

                                        <div className='p-md-6' style={{ padding: 0 }}></div>

                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Número</label>
                                            <InputText
                                                min={'01'}
                                                max={'99'}
                                                maxLength={2}
                                                type={'number'}
                                                value={this.state.filial.codigo}
                                                onChange={(e) => this.setState({ filial: { ...this.state.filial, codigo: e.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome filial</label>
                                            <InputText
                                                value={this.state.filial.nome}
                                                onChange={(e) => this.setState({ filial: { ...this.state.filial, nome: e.target.value.toUpperCase() } })} />
                                        </div>

                                        <div className='p-md-4' style={{ padding: 0 }}></div>

                                        <div className='p-col-12 p-md-8'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cidade</label>
                                            <InputText
                                                value={this.state.filial.cidade}
                                                onChange={(e) => this.setState({ filial: { ...this.state.filial, cidade: e.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-8'>
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
                    </div >
                </div >
            </div >
        );
    }
}

export default withRouter(FilialView);