import Toasty from '../toasty';
import Loading from '../loading';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { withRouter } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { InputMask } from 'primereact/inputmask';
import Api, { saveFile } from '../../services/Api';
import ErrorHandler from '../../services/ErrorHandler';


import * as moment from 'moment';

function Filtro() {
    this.data = undefined;
    this.codigo = undefined;
    this.evento = undefined;
    this.empresa = undefined;
    this.periodo = undefined;
}

let url = 'notas';
let eventos = [];
let periodos = [];

class ArquivoFolha extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            first: 0,
            lista: [],
            totalRecords: 0,
            filtro: new Filtro(),
            totalNotas: 'R$ 0,00',
        }

        this.onPage = this.onPage.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Arquivo folha';
    }

    componentDidMount() {
        setTimeout(async () => {
            await this.pesquisarEventos();
            await this.pesquisarPeriodos();
        }, 300);
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

    pesquisarEventos = async () => {
        Loading.onShow();

        eventos = [];
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
                codigo: e.codigo,
                empresa: e.empresa,
                label: `${e.codigo} - ${e.descricao} - ${e.nomeEmpresa}`
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
                periodo: this.state.filtro.periodo,
                evento: this.state.filtro.evento,
            }
        }).then(resp => {
            Loading.onHide()

            let x = resp.data.content;
            this.totalLista(x);
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

    arquivoFolha = async () => {
        Loading.onShow();

        await Api({
            method: 'post',
            url: `${url}/TXT`,
            data: {
                data: this.state.filtro.data,
                evento: this.state.filtro.evento,
                periodo: this.state.filtro.periodo,
                empresa: this.state.filtro.empresa,
            },
            responseType: 'blob',
        }).then(resp => {
            Loading.onHide();
            saveFile(resp.data, 'arquivoFolha.txt');
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
                periodo: this.state.filtro.periodo,
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

    validaData(value) {
        return moment(value, 'DD/MM/YYYY', true).isValid();
    }

    validPesquisa = () => {
        if (this.state.filtro.evento !== undefined && this.state.filtro.evento !== null &&
            this.state.filtro.periodo !== undefined && this.state.filtro.periodo !== null &&
            this.validaData(this.state.filtro.data)) {
            return true;
        } else {
            return false;
        }
    }

    onChangeEvento = async (e) => {
        await this.setState({ filtro: { ...this.state.filtro, evento: e.value } });

        for (let index = 0; index < eventos.length; index++) {
            if (e.value === eventos[index].value) {
                this.setState({ filtro: { ...this.state.filtro, codigo: eventos[index].codigo, empresa: eventos[index].empresa } });
            }
        }
    }

    totalLista(value) {
        var totalNotas = 0;
        for (const x of value) {
            totalNotas += x.valor;
        }

        totalNotas = totalNotas.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        this.setState({ totalNotas });
    }

    formataMoney(value) {
        for (const x of value) {
            x.valor = x.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }
    }

    onPage(event) {
        this.pesquisar(event.page, event.rows, event.first).then(
            this.setState({ first: event.first, rows: event.rows, page: event.page })
        );
    }

    render() {
        var footer = 'Quantidade de registros ' + this.state.totalRecords;

        var header =
            <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>
                LISTA DE NOTAS --- [ TOTAL LISTADO {this.state.totalNotas} ]
        </div>;

        return (
            <div className='p-fluid'>
                <div className='p-grid'>
                    <div className='p-col-12'>
                        <Card>
                            <div className='p-grid'>
                                <div className='p-col-12 p-md-2'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data de pagamento</label>
                                    <InputMask
                                        mask='99/99/9999'
                                        value={this.state.filtro.data}
                                        onChange={(e) => this.setState({ filtro: { ...this.state.filtro, data: e.target.value } })}
                                    />
                                </div>
                                <div style={{ padding: 0 }} className='p-md-10'></div>
                                <div className='p-col-12 p-md-5'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Período</label>
                                    <Dropdown
                                        options={periodos}
                                        value={this.state.filtro.periodo}
                                        filter={true} filterPlaceholder='Pesquisar período' filterBy='label,value'
                                        onChange={(e) => this.setState({ filtro: { ...this.state.filtro, periodo: e.value } })}
                                    />
                                </div>
                                <div style={{ padding: 0 }} className='p-md-7'></div>
                                <div className='p-col-12 p-md-7'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Evento</label>
                                    <Dropdown
                                        options={eventos}
                                        value={this.state.filtro.evento}
                                        filter={true} filterPlaceholder='Pesquisar evento' filterBy='label,value'
                                        onChange={(e) => this.onChangeEvento(e)}
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
                                <div className='p-col-12 p-md-1' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <Button
                                        label='TXT'
                                        icon='pi pi-external-link'
                                        className='p-button-success'
                                        onClick={() => this.arquivoFolha()}
                                        disabled={this.state.lista.length === 0}
                                    />
                                </div>
                                <div className='p-col-12 p-md-1' style={{ display: 'flex', alignItems: 'flex-end' }}>
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

export default withRouter(ArquivoFolha);  