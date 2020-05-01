import Toasty from '../toasty';
import Loading from '../loading';
import Api from '../../services/Api';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { withRouter } from 'react-router-dom';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import ErrorHandler from '../../services/ErrorHandler';
import { TabView, TabPanel } from 'primereact/tabview';
import confirmService from '../../services/confirmService';

import { Empresa } from '../Model';

let url = 'empresas';

class EmpresaView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            page: 0,
            first: 0,
            lista: [],
            activeIndex: 0,
            totalRecords: 0,
            razaoSocial: undefined,
            empresa: new Empresa(),
        };

        this.onPage = this.onPage.bind(this);
        this.acoesTabela = this.acoesTabela.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Empresa';
    }

    componentDidMount() {
        setTimeout(() => {
            this.pesquisar(this.state.page, this.state.rows);
        }, 300);
    }

    pesquisar = async (pagina = 0, rows = this.state.rows, first = 0) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                size: rows,
                page: pagina,
                razaoSocial: this.state.razaoSocial
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
            Toasty.success('Sucesso!', 'Registro excluído com sucesso!');
            this.pesquisar();
        })
            .catch(error => {
                ErrorHandler(error);
                Loading.onHide();
            })
    }

    salvar = async () => {
        Loading.onShow();

        if (this.state.empresa.id > 0) {

            await Api({
                method: 'put',
                url: `${url}/${this.state.empresa.id}`,
                data: JSON.stringify((this.state.empresa))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Empresa editada com sucesso!');
            })
                .catch(error => {
                    ErrorHandler(error);
                    Loading.onHide();
                });

        } else {
            await Api({
                method: 'post',
                url: `${url}`,
                data: JSON.stringify((this.state.empresa))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Empresa adicionada com sucesso!');
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
        this.setState({ activeIndex: 1, empresa: value });
    }

    inserir = () => {
        this.setState({ activeIndex: 1, empresa: new Empresa() });
    }

    cancelar = () => {
        this.setState({ activeIndex: 0 });
    }

    validCnpj() {
        if (this.state.empresa.cnpj !== null && this.state.empresa.cnpj !== undefined) {
            if (this.state.empresa.cnpj.length === 18) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validaNome() {
        if (this.state.empresa.nomeEmpresa !== null && this.state.empresa.nomeEmpresa !== undefined) {
            if (this.state.empresa.nomeEmpresa.length > 3) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validFantasia() {
        if (this.state.empresa.nomeFantasia !== null && this.state.empresa.nomeFantasia !== undefined) {
            if (this.state.empresa.nomeFantasia.length > 3) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validAssociacao() {
        if (this.state.empresa.nomeAssociacao !== null && this.state.empresa.nomeAssociacao !== undefined) {
            if (this.state.empresa.nomeAssociacao.length > 3) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validaFormulario() {
        if (this.validCnpj() && this.validaNome() && this.validFantasia() && this.validAssociacao()) {
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
            Lista de empresas
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
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Razão social</label>
                                            <InputText value={this.state.razaoSocial} onChange={(e) => this.setState({ razaoSocial: e.target.value.toUpperCase() })} />
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
                                                <Column field='nomeEmpresa' header='Razão Social' />
                                                <Column field='nomeFantasia' header='Nome Fantasia' />
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
                                                value={this.state.empresa.id}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-10'></div>

                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>CNPJ</label>
                                            <InputText
                                                minLength={18}
                                                maxLength={18}
                                                value={this.state.empresa.cnpj}
                                                onChange={(texto) =>
                                                    this.setState({ empresa: { ...this.state.empresa, cnpj: texto.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-8'></div>

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome empresa</label>
                                            <InputText
                                                value={this.state.empresa.nomeEmpresa}
                                                onChange={(texto) =>
                                                    this.setState({ empresa: { ...this.state.empresa, nomeEmpresa: texto.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-6'></div>

                                        <div className='p-col-12 p-md-7'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome fantasia</label>
                                            <InputText
                                                value={this.state.empresa.nomeFantasia}
                                                onChange={(texto) =>
                                                    this.setState({ empresa: { ...this.state.empresa, nomeFantasia: texto.target.value.toUpperCase() } })}
                                            />
                                        </div>


                                        <div style={{ padding: 0 }} className='p-md-5'></div>

                                        <div className='p-col-12 p-md-8'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome associação</label>
                                            <InputText
                                                required
                                                value={this.state.empresa.nomeAssociacao}
                                                onChange={(texto) =>
                                                    this.setState({ empresa: { ...this.state.empresa, nomeAssociacao: texto.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div className='p-md-4'></div>

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
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(EmpresaView);