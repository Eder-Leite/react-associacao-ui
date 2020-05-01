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

import { Evento } from '../Model';

let url = 'eventos';
let urlEmpresa = 'empresas';
let listaEmpresas = [];

class EventoView extends Component {

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
            evento: new Evento(),
        };

        this.onPage = this.onPage.bind(this);
        this.acoesTabela = this.acoesTabela.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Evento';
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

    onChangeEmpresaEvento = (e) => {
        this.setState({
            evento: {
                ...this.state.evento, empresa: {
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

    pesquisar = async (pagina = 0, rows = this.state.rows, first = 0) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                size: rows,
                page: pagina,
                empresa: this.state.empresa
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

    onPage(event) {
        this.pesquisar(event.page, event.rows, event.first).then(
            this.setState({ first: event.first, rows: event.rows, page: event.page })
        );
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

        if (this.state.evento.id > 0) {

            await Api({
                method: 'put',
                url: `${url}/${this.state.evento.id}`,
                data: JSON.stringify((this.state.evento))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Evento editada com sucesso!');
            })
                .catch(error => {
                    ErrorHandler(error);
                    Loading.onHide();
                });

        } else {
            await Api({
                method: 'post',
                url: `${url}`,
                data: JSON.stringify((this.state.evento))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Evento adicionada com sucesso!');
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
        const evento = {
            id: value.id,
            empresa: {
                id: value.empresa,
            },
            codigo: value.codigo,
            descricao: value.descricao
        };

        this.setState({ activeIndex: 1, evento: evento });
    }

    inserir = () => {
        this.setState({ activeIndex: 1, evento: new Evento() });
    }

    cancelar = () => {
        this.setState({ activeIndex: 0 });
    }

    validDescricao() {
        if (this.state.evento.descricao !== null && this.state.evento.descricao !== undefined) {
            if (this.state.evento.descricao.length > 5) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validCodigo() {
        if (this.state.evento.codigo !== null && this.state.evento.codigo !== undefined) {
            if (this.state.evento.codigo.length >= 3) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validEmpresa() {
        if (this.state.evento.empresa !== null && this.state.evento.empresa !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    validaFormulario() {
        if (this.validDescricao() && this.validCodigo() && this.validDescricao()) {
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

        var header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>
            Lista de eventos
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
                                                <Column field='codigo' header='Evento' style={{ width: '8em' }} />
                                                <Column field='nomeEmpresa' header='Empresa' />
                                                <Column field='descricao' header='Descrição' />
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
                                                value={this.state.evento.id}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-10'></div>

                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Evento</label>
                                            <InputText
                                                maxlength={3}
                                                value={this.state.evento.codigo}
                                                onChange={(e) => this.setState({ evento: { ...this.state.evento, codigo: e.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-10'></div>

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Empresa</label>
                                            <Dropdown
                                                dataKey='value'
                                                showClear={true}
                                                options={listaEmpresas}
                                                value={this.state.evento.empresa.id}
                                                onChange={(e) => this.setState({ evento: { ...this.state.evento, empresa: { id: e.value } } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-7'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                            <InputText
                                                value={this.state.evento.descricao}
                                                onChange={(e) => this.setState({ evento: { ...this.state.evento, descricao: e.target.value.toUpperCase() } })}
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

export default withRouter(EventoView);