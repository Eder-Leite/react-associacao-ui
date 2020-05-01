import Toasty from '../toasty';
import Loading from '../loading';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { withRouter } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import Api, { saveFile } from '../../services/Api';
import ErrorHandler from '../../services/ErrorHandler';

function Filtro() {
    this.periodo = undefined;
    this.cracha = undefined;
    this.nomeFuncionario = undefined;
}

let url = 'notas';
let periodos = [];

class DebitoFuncionario extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            first: 0,
            lista: [],
            filtro: new Filtro(),
            totalRecords: 0,
            periodo: undefined
        }

        this.onPage = this.onPage.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Débito funcionário';
    }

    componentDidMount() {
        setTimeout(async () => {
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

    pesquisar = async (pagina = 0, rows = this.state.rows, first = 0) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                size: rows,
                page: pagina,
                cracha: this.state.filtro.cracha,
                periodo: this.state.filtro.periodo,
                nomeFuncionario: this.state.filtro.nomeFuncionario,
            },
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

    exportarXLS = async () => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?XLS`,
            params: this.state.filtro,
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

    onChangePeriodo = (e) => {
        this.setState({ filtro: { ...this.state.filtro, periodo: e.value } });
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
                                <div className='p-col-12 p-md-2'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Crachá</label>
                                    <InputText
                                        maxLength={7}
                                        keyfilter={/[0-9]+$/}
                                        value={this.state.filtro.cracha}
                                        onChange={(e) => this.setState({ filtro: { ...this.state.filtro, cracha: e.target.value } })}
                                    />
                                </div>
                                <div style={{ padding: 0 }} className='p-md-10'></div>
                                <div className='p-col-12 p-md-5'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome funcionário</label>
                                    <InputText
                                        value={this.state.filtro.nomeFuncionario}
                                        onChange={(e) => this.setState({ filtro: { ...this.state.filtro, nomeFuncionario: e.target.value.toUpperCase() } })}
                                    />
                                </div>
                                <div style={{ padding: 0 }} className='p-md-7'></div>
                                <div className='p-col-12 p-md-5'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Período</label>
                                    <Dropdown
                                        showClear={true}
                                        options={periodos}
                                        value={this.state.filtro.periodo}
                                        onChange={(e) => this.onChangePeriodo(e)}
                                        filter={true} filterPlaceholder='Pesquisar período' filterBy='label,value'
                                    />
                                </div>
                                <div className='p-col-12 p-md-2' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                    <Button
                                        label='Pesquisar'
                                        icon='pi pi-search'
                                        onClick={() => this.pesquisar(0, this.state.rows, 0)}
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

export default withRouter(DebitoFuncionario);  