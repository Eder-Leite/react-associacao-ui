import Toasty from '../toasty';
import Loading from '../loading';
import Api from '../../services/Api';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { withRouter } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputMask } from 'primereact/inputmask';
import { DataTable } from 'primereact/datatable';
import ErrorHandler from '../../services/ErrorHandler';
import { TabView, TabPanel } from 'primereact/tabview';
import confirmService from '../../services/confirmService';

import * as moment from 'moment';
import { Periodo } from '../Model';

let url = 'periodos';
let situacoes = [
    { label: 'ABERTO', value: 'ABERTO' },
    { label: 'FECHADO', value: 'FECHADO' }
]

class PeriodoView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            page: 0,
            first: 0,
            lista: [],
            totalRecords: 0,
            situacao: undefined,
            descricao: undefined,
            periodo: new Periodo()
        };

        this.onPage = this.onPage.bind(this);
        this.acoesTabela = this.acoesTabela.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Período';
    }

    componentDidMount() {
        setTimeout(() => {
            this.pesquisar();
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
                situacao: this.state.situacao,
                descricao: this.state.descricao
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

    converterStringsParaDatas(p) {
        p.dataFim = moment(p.dataFim, 'YYYY-MM-DD').toDate();
        p.dataInicio = moment(p.dataInicio, 'YYYY-MM-DD').toDate();
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
  
        if (this.state.periodo.id > 0) {

            await Api({
                method: 'put',
                url: `${url}/${this.state.periodo.id}`,
                data: JSON.stringify((this.state.periodo))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Período editada com sucesso!');
            })
                .catch(error => {
                    ErrorHandler(error);
                    Loading.onHide();
                });

        } else {
            await Api({
                method: 'post',
                url: `${url}`,
                data: JSON.stringify((this.state.periodo))
            }).then(resp => {
                Loading.onHide();
                this.pesquisar();
                this.setState({ activeIndex: 0 });
                Toasty.success('Sucesso!', 'Período adicionada com sucesso!');
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
        this.setState({ activeIndex: 1, periodo: value });
    }

    inserir = () => {
        this.setState({ activeIndex: 1, periodo: new Periodo() });
    }

    cancelar = () => {
        this.setState({ activeIndex: 0 });
    }

    validDescricao() {
        if (this.state.periodo.descricao !== null && this.state.periodo.descricao !== undefined) {
            if (this.state.periodo.descricao.length > 9) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validMes() {
        if (this.state.periodo.mes !== null && this.state.periodo.mes !== undefined) {
            if (this.state.periodo.mes > 0 && this.state.periodo.mes < 13) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validAno() {
        if (this.state.periodo.ano !== null && this.state.periodo.ano !== undefined) {
            if (this.state.periodo.ano > 2015 && this.state.periodo.ano < 10000) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validaData(value) {
        return moment(value, 'DD/MM/YYYY', true).isValid();
    }

    validDataInicio() {
        if (this.state.periodo.dataInicio !== null && this.state.periodo.dataInicio !== undefined) {
            if (this.validaData(this.state.periodo.dataInicio)){
                return true; 
            }else{
                return true;
            }
        } else {
            return false;
        }
    }

    validDataFim() {
        if (this.state.periodo.dataFim !== null && this.state.periodo.dataFim !== undefined) {
            if (this.validaData(this.state.periodo.dataFim)){
                return true; 
            }else{
                return true;
            }
        } else {
            return false;
        }
    }

    validSituacao() {
        if (this.state.periodo.situacao !== null && this.state.periodo.situacao !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    validaFormulario() {
        if (this.validDescricao() && this.validMes() && this.validAno() && this.validDataInicio() && this.validDataFim() && this.validSituacao()) {
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
            Lista de períodos
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
                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Situação</label>
                                            <Dropdown
                                                showClear={true}
                                                options={situacoes}
                                                value={this.state.situacao}
                                                onChange={(e) => this.setState({ situacao: e.target.value })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-8'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                            <InputText value={this.state.descricao} onChange={(e) => this.setState({ descricao: e.target.value.toUpperCase() })} />
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
                                                <Column field='descricao' header='Descrição' />
                                                <Column field='dataInicio' header='Data inicial' style={{ width: '8em' }} />
                                                <Column field='dataFim' header='Data final' style={{ width: '8em' }} />
                                                <Column field='situacao' header='Situação' style={{ width: '9em' }} />
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
                                                value={this.state.periodo.id}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-10'></div>

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Descrição</label>
                                            <InputText
                                                value={this.state.periodo.descricao}
                                                onChange={(e) => this.setState({ periodo: { ...this.state.periodo, descricao: e.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-6'></div>

                                        <div className='p-col-12 p-md-1'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Mês</label>
                                            <InputText
                                                type='number'
                                                maxLength={2}
                                                value={this.state.periodo.mes}
                                                onChange={(e) => this.setState({ periodo: { ...this.state.periodo, mes: e.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-1'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Ano</label>
                                            <InputText
                                                type='number'
                                                maxLength={4}
                                                value={this.state.periodo.ano}
                                                onChange={(e) => this.setState({ periodo: { ...this.state.periodo, ano: e.target.value.toUpperCase() } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data final</label>
                                            <InputMask
                                                mask='99/99/9999'
                                                value={this.state.periodo.dataInicio}
                                                onChange={(e) => this.setState({ periodo: { ...this.state.periodo, dataInicio: e.target.value } })}
                                            />
                                        </div>

                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data final</label>
                                            <InputMask
                                                mask='99/99/9999'
                                                value={this.state.periodo.dataFim}
                                                onChange={(e) => this.setState({ periodo: { ...this.state.periodo, dataFim: e.target.value } })}
                                            />
                                        </div>

                                        <div style={{ padding: 0 }} className='p-md-6'></div>

                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Situação</label>
                                            <Dropdown
                                                showClear={true}
                                                options={situacoes}
                                                value={this.state.periodo.situacao}
                                                onChange={(e) => this.setState({ periodo: { ...this.state.periodo, situacao: e.value } })}
                                            />
                                        </div>

                                        <div className='p-md-6'></div>

                                        <div className='p-col-12 p-md-6'>
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
                                                        onClick={() => this.cancelar()}
                                                        className='p-button-danger'
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

export default withRouter(PeriodoView);