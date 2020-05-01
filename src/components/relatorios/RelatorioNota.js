import Toasty from '../toasty';
import Loading from '../loading';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { withRouter } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import ErrorHandler from '../../services/ErrorHandler';
import Api, { getProfile, temQualquerPermissao, saveFile } from '../../services/Api';

function Filtro() {
    this.empresa = undefined;
    this.periodo = undefined;
    this.evento = undefined;
    this.departamento = undefined;
    this.tipoDesconto = undefined;
}

let url = 'notas';
let eventos = [];
let periodos = [];
let departamentos = [];
let tipoDescontos = [];

class RelatorioNota extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            first: 0,
            lista: [],
            totalRecords: 0,
            filtro: new Filtro(),
            usuario: parseInt(getProfile().usuario),
        }

        this.onPage = this.onPage.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Relatório nota';
    }

    componentDidMount() {
        setTimeout(async () => {
            await this.pesquisarEventos();
            await this.pesquisarPeriodos();
            await this.pesquisarDepartamentos();
            this.setState({ filtro: { departamento: parseInt(getProfile().departamento) } });
            await this.pesquisarTipoDescontos(this.state.filtro.departamento);
        }, 300);
    }

    pesquisarEventos = async () => {
        eventos = [];
        Loading.onShow();

        await Api({
            method: 'get',
            url: 'eventos?resumo',
            params: {
                size: 99999
            }
        }).then(resp => {
            Loading.onHide();
            eventos = resp.data.content.map((e) => ({
                value: e.id,
                empresa: e.empresa,
                label: `${e.codigo} - ${e.descricao} - ${e.nomeEmpresa}`
            }))
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    pesquisarPeriodos = async () => {
        Loading.onShow();

        periodos = [];
        await Api({
            method: 'get',
            url: 'periodos?resumo',
            params: {
                size: 99999
            }
        }).then(resp => {
            Loading.onHide();
            periodos = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.descricao}`
            }))
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    pesquisarDepartamentos = async () => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: 'departamentos?resumo',
            params: {
                size: 99999
            }
        }).then(resp => {
            Loading.onHide();
            departamentos = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.nome}`
            }));
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    pesquisarTipoDescontos = async (value) => {
        tipoDescontos = [];

        Loading.onShow();

        await Api({
            method: 'get',
            url: 'tipoDescontos?resumo',
            params: {
                size: 99999,
                departamento: value
            }
        }).then(resp => {
            Loading.onHide();
            tipoDescontos = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.descricao} - ${e.nomeDepartamento}`
            }))
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    pesquisar = async (pagina = 0, rows = 5, first = 0) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                size: rows,
                page: pagina,
                evento: this.state.filtro.evento,
                empresa: this.state.filtro.empresa,
                periodo: this.state.filtro.periodo,
                departamento: this.state.filtro.departamento,
                tipoDesconto: this.state.filtro.tipoDesconto,
            }
        }).then(resp => {
            Loading.onHide()

            let x = resp.data.content;
            this.formataMoney(x);

            this.setState(
                {
                    lista: x,
                    first: first,
                    totalRecords: resp.data.totalElements
                }
            );
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    impressao = async () => {
        Loading.onShow();

        await Api({
            method: 'post',
            url: `${url}/relatorioPDF`,
            data: {
                EVENTO: this.state.filtro.evento,
                EMPRESA: this.state.filtro.empresa,
                PERIODO: this.state.filtro.periodo,
                DESPESA: this.state.filtro.tipoDesconto,
            },
            responseType: 'blob',
        }).then(resp => {
            Loading.onHide();
            saveFile(resp.data, 'relatorioNotas.pdf');
            Toasty.success('Sucesso', 'Impressão gerada com sucesso!');
        })
            .catch(error => {
                ErrorHandler(error);
                Loading.onHide();
            })
    }

    exportarXLS = async () => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?XLS`,
            params: {
                evento: this.state.filtro.evento,
                empresa: this.state.filtro.empresa,
                periodo: this.state.filtro.periodo,
                tipoDesconto: this.state.filtro.tipoDesconto,
            },
            responseType: 'blob',
        }).then(resp => {
            Loading.onHide();
            saveFile(resp.data, 'notas.xls');
            Toasty.success('Sucesso', 'XLS gerado com sucesso!');
        })
            .catch((e) => {
                ErrorHandler(e);
                Loading.onHide();
            })
    }

    validPesquisa = () => {
        if (this.state.filtro.evento !== undefined &&
            this.state.filtro.empresa !== undefined &&
            this.state.filtro.periodo !== undefined &&
            this.state.filtro.tipoDesconto !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    formataMoney(notas) {
        for (const x of notas) {
            x.valor = x.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }
    }

    onPage(event) {
        this.pesquisar(event.page, event.rows, event.first).then(
            this.setState({ first: event.first, rows: event.rows, page: event.page })
        );
    }

    onChangeDepartamento = (e) => {
        this.pesquisarTipoDescontos(e.value);
        this.setState({ filtro: { ...this.state.filtro, departamento: e.value, tipoDesconto: undefined } });
    }

    onChangePeriodo = (e) => {
        this.setState({ filtro: { ...this.state.filtro, periodo: e.value } });
    }

    onChangeEvento = async (e) => {
        await this.setState({ filtro: { ...this.state.filtro, evento: e.value } });

        for (let index = 0; index < eventos.length; index++) {
            if (eventos[index].value === e.value) {
                this.setState({ filtro: { ...this.state.filtro, empresa: eventos[index].empresa } });
            }
        }
    }

    onChangeTipoDesconto = (e) => {
        this.setState({ filtro: { ...this.state.filtro, tipoDesconto: e.value } })
    }

    render() {
        var footer = 'Quantidade de registros ' + this.state.totalRecords;

        var header =
            <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>
                Lista de notas
        </div>;

        return (
            <div className='p-fluid'>
                <div className='p-grid'>
                    <div className='p-col-12'>
                        <Card>
                            <div className='p-grid'>
                                <div className='p-col-12 p-md-4'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Departamento</label>
                                    <Dropdown
                                        showClear={true}
                                        options={departamentos}
                                        value={this.state.filtro.departamento}
                                        onChange={(e) => this.onChangeDepartamento(e)}
                                        disabled={!temQualquerPermissao(['ROLE_ADMIN', 'ROLE_RH'])}
                                    />
                                </div>
                                <div style={{ padding: 0 }} className='p-md-8'></div>
                                <div className='p-col-12 p-md-5'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Período</label>
                                    <Dropdown
                                        options={periodos}
                                        value={this.state.filtro.periodo}
                                        onChange={(e) => this.onChangePeriodo(e)}
                                        filter={true} filterPlaceholder='Pesquisar período' filterBy='label,value'
                                    />
                                </div>
                                <div style={{ padding: 0 }} className='p-md-7'></div>
                                <div className='p-col-12 p-md-6'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Evento</label>
                                    <Dropdown
                                        options={eventos}
                                        value={this.state.filtro.evento}
                                        onChange={(e) => this.onChangeEvento(e)}
                                        filter={true} filterPlaceholder='Pesquisar evento' filterBy='label,value'
                                    />
                                </div>
                                <div style={{ padding: 0 }} className='p-md-6'></div>
                                <div className='p-col-12 p-md-6'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo desconto</label>
                                    <Dropdown
                                        options={tipoDescontos}
                                        value={this.state.filtro.tipoDesconto}
                                        onChange={(e) => this.onChangeTipoDesconto(e)}
                                        filter={true} filterPlaceholder='Pesquisar tipo desconto' filterBy='label,value'
                                    />
                                </div>
                                <div className='p-col-12 p-md-2' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <Button
                                        label='Pesquisar'
                                        icon='pi pi-search'
                                        disabled={!this.validPesquisa()}
                                        onClick={() => this.pesquisar(0, this.state.rows, 0)}
                                    />
                                </div>
                                <div className='p-col-12 p-md-2' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <Button
                                        label='Impressão'
                                        icon='pi pi-print'
                                        className='p-button-success'
                                        onClick={() => this.impressao()}
                                        disabled={this.state.lista.length === 0}
                                    />
                                </div>
                                <div className='p-col-12 p-md-2' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <Button
                                        label='XLS'
                                        icon='pi pi-external-link'
                                        className='p-button-warning'
                                        onClick={() => this.exportarXLS()}
                                        disabled={this.state.lista.length === 0}
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
                                    emptyMessage={'Nenhum registro encontrado!'}
                                    rowsPerPageOptions={[5, 10, 20, 50, 100, 500]}
                                >
                                    <Column field='id' header='Nota' style={{ width: '6em' }} />
                                    <Column field='parcela' style={{ width: '10em' }} header='Parcela' />
                                    <Column field='data' style={{ width: '12em' }} header='Emissão' />
                                    <Column field='funcionario' header='Funcionário' />
                                    <Column field='periodo' header='Período' />
                                    <Column field='usuario' header='Usuário' />
                                    <Column field='valor' style={{ width: '8em' }} header='Valor' />
                                </DataTable>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(RelatorioNota);  