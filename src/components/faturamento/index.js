import Toasty from '../toasty';
import Loading from '../loading';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { withRouter } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { InputMask } from 'primereact/inputmask';
import { InputText } from 'primereact/inputtext';
import ErrorHandler from '../../services/ErrorHandler';
import { TabView, TabPanel } from 'primereact/tabview';
import { AutoComplete } from 'primereact/autocomplete';
import confirmService from '../../services/confirmService';
import Api, { getProfile, temQualquerPermissao, saveFile } from '../../services/Api';

import * as moment from 'moment';
import { formatMoney } from '../../services/MaskMoney';
import { Nota, NotaFilter, ManipulaNota } from '../Model';

let url = 'notas';
let usuarios = [];
let empresas = [];
let periodos = [];
let eventos = [];
let funcionarios = [];
let tipoDescontos = [];
let departamentos = [];
let eventosPesquisa = [];
let periodosPesquisa = [];
let departamentosPesquisa = [];
let tipoDescontosPesquisa = [];

class FaturamentoView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            first: 0,
            lista: [],
            notas: [],
            activeIndex: 0,
            visible: false,
            totalRecords: 0,
            valor: 'R$ 0,00',
            empresa: undefined,
            notaEditar: new Nota(),
            funcionario: undefined,
            funcionarios: undefined,
            nota: new ManipulaNota(),
            parametro: new NotaFilter(),
            usuario: parseInt(getProfile().usuario),
            departamento: parseInt(getProfile().departamento),
        };

        this.onPage = this.onPage.bind(this);
        this.acoesTabela = this.acoesTabela.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Faturamento';
    }

    componentDidMount() {
        setTimeout(() => {
            this.pesquisarEmpresas();
            this.pesquisarDepartamentos();
            this.pesquisarEventosPesquisa();
            this.pesquisarPeriodosPesquisa();
            this.pesquisarUsuarios(getProfile().departamento);
            this.pesquisarTipoDescontosPesquisa(getProfile().departamento);
        }, 300);
    }

    procurarFuncionario = async (event) => {

        await Api({
            method: 'get',
            url: 'funcionarios?resumo&status=ATIVO',
            params: {
                size: 99999,
                empresa: this.state.empresa,
                nomeFuncionario: event.query.toLowerCase()
            }
        }).then(resp => {
            funcionarios = resp.data.content.map((e) => ({
                id: e.id,
                empresa: e.empresa,
                nomeFuncionario: e.nomeFuncionario,
            }));

            this.setState({ funcionarios });
        })
            .catch(error => {
                ErrorHandler(error);
            })
    }

    pesquisarEmpresas = async () => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: 'empresas?resumo',
            params: {
                size: 99999
            }
        }).then(resp => {
            Loading.onHide();
            empresas = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.nomeEmpresa}`
            }))
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    pesquisarUsuarios = async (value) => {
        usuarios = [];

        if (!!value) {
            Loading.onShow();

            await Api({
                method: 'get',
                url: 'usuarios?resumo',
                params: {
                    size: 99999,
                    departamento: value
                }
            }).then(resp => {
                Loading.onHide();
                usuarios = resp.data.content.map((e) => ({
                    value: e.id,
                    label: `${e.nome}`
                }))
            })
                .catch(error => {
                    Loading.onHide();
                    ErrorHandler(error);
                })
        }
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

            departamentosPesquisa = departamentos;

            this.setState({
                parametro: {
                    ...this.state.parametro, departamento: this.state.departamento
                }
            });
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
            url: 'periodos?resumo&situacao=ABERTO',
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

    pesquisarPeriodosPesquisa = async () => {
        Loading.onShow();

        periodosPesquisa = [];
        await Api({
            method: 'get',
            url: 'periodos?resumo',
            params: {
                size: 99999
            }
        }).then(resp => {
            Loading.onHide();
            periodosPesquisa = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.descricao}`
            }))
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    pesquisarEventos = async (value) => {
        eventos = [];

        if (!!value) {
            Loading.onShow();

            await Api({
                method: 'get',
                url: 'eventos?resumo',
                params: {
                    size: 99999,
                    empresa: value
                }
            }).then(resp => {
                Loading.onHide();
                eventos = resp.data.content.map((e) => ({
                    value: e.id,
                    label: `${e.codigo} - ${e.descricao} - ${e.nomeEmpresa}`
                }))
            })
                .catch(error => {
                    Loading.onHide();
                    ErrorHandler(error);
                })
        }
    }

    pesquisarEventosPesquisa = async () => {
        eventosPesquisa = [];
        this.setState({ parametro: { ...this.state.parametro, evento: undefined } });

        Loading.onShow();

        await Api({
            method: 'get',
            url: 'eventos?resumo',
            params: {
                size: 99999
            }
        }).then(resp => {
            Loading.onHide();
            eventosPesquisa = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.codigo} - ${e.descricao} - ${e.nomeEmpresa}`
            }))
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    pesquisarTipoDescontos = async (value) => {
        tipoDescontos = [];

        if (!!value) {
            Loading.onShow();

            await Api({
                method: 'get',
                url: 'tipoDescontos?resumo&status=ATIVO',
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
    }

    pesquisarTipoDescontosPesquisa = async (value) => {
        tipoDescontosPesquisa = [];

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
            tipoDescontosPesquisa = resp.data.content.map((e) => ({
                value: e.id,
                label: `${e.descricao} - ${e.nomeDepartamento}`
            }))
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    buscarNota = async (value) => {
        Loading.onShow();
        this.setState({ notaEditar: new Nota() });

        await Api({
            method: 'get',
            url: `${url}/${value}`,
        }).then(resp => {
            Loading.onHide();
            this.setState({ notaEditar: resp.data });
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    salvarNota = async () => {
        Loading.onShow();
        await this.setState({ notaEditar: { ...this.state.notaEditar, valorNota: this.valorDeGeracao(this.state.notaEditar.valorNota) } });

        await Api({
            method: 'put',
            url: `${url}/${this.state.notaEditar.id}`,
            data: JSON.stringify(this.state.notaEditar),
        }).then(resp => {
            Loading.onHide();
            this.pesquisarNotas();
            this.setState({ activeIndex: 0 });
            Toasty.success('Sucesso!', 'Nota editada com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
                this.setState({ notaEditar: { ...this.state.notaEditar, valorNota: this.mascaraMoney(this.state.notaEditar.valorNota) } });
            })
    }

    onChangeDepartamento(e) {
        this.setState({
            departamento: e.target.value,
            nota: { ...this.state.nota, tipoDesconto: undefined }
        });

        this.pesquisarTipoDescontos(e.target.value);
    }

    onChangeDepartamentoPesquisa(e) {
        this.setState({
            parametro: { ...this.state.parametro, departamento: e.target.value, tipoDesconto: undefined, usuario: undefined }
        });

        this.pesquisarUsuarios(e.target.value);
        this.pesquisarTipoDescontosPesquisa(e.target.value);
    }

    onChangeEmpresa(e) {
        this.setState({
            empresa: e.target.value,
            nota: { ...this.state.nota, funcionario: undefined, evento: undefined }
        });

        this.pesquisarEventos(e.target.value);
    }

    inserirNota() {
        this.pesquisarPeriodos();
        this.setState({ activeIndex: 2 });
        this.pesquisarTipoDescontos(this.state.departamento);
        this.setState({ nota: new ManipulaNota(), empresa: undefined, valor: 'R$ 0,00', funcionario: undefined });
    }

    editarNota = async (value) => {
        await this.pesquisarPeriodos();
        await this.buscarNota(value);
        await this.pesquisarEventos(this.state.notaEditar.empresa.id);
        await this.pesquisarTipoDescontos(this.state.notaEditar.departamento.id);
        await this.setState({ activeIndex: 1, notaEditar: { ...this.state.notaEditar, valorNota: this.mascaraMoney(this.state.notaEditar.valorNota) } });
    }

    limpar() {
        this.setState({ nota: new ManipulaNota(), empresa: undefined, valor: 'R$ 0,00', funcionario: undefined });
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

    excluir = async (value) => {
        Loading.onShow();

        await Api({
            method: 'delete',
            url: `${url}/${value}`
        }).then(resp => {
            Loading.onHide();
            this.pesquisarNotas();
            Toasty.success('Sucesso!', 'Registro excluído com sucesso!');
        })
            .catch(error => {
                ErrorHandler(error);
                Loading.onHide();
            })
    }

    valorDeGeracao(value) {
        var numsStr = value.replace(/[^0-9-]/g, '');
        return parseInt(numsStr) / 100;
    }

    gerarNota = async () => {
        Loading.onShow();

        await this.setState({
            nota: { ...this.state.nota, usuario: this.state.usuario, funcionario: this.state.funcionario.id, empresa: this.state.funcionario.empresa, valor: this.valorDeGeracao(this.state.valor) }
        });

        await Api({
            method: 'post',
            url: `${url}/geraNotaDepartamento`,
            data: JSON.stringify(this.state.nota)
        }).then(resp => {
            Loading.onHide()
            this.setState({ funcionario: undefined });
            Toasty.success('Sucesso', 'Nota(s) gerada(s) sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
                this.setState({ nota: { ...this.state.nota, valor: this.mascaraMoney(this.state.valor) } });
            })
    }

    pesquisarNotas = async (pagina = 0, rows = this.state.rows, first = 0) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?resumo`,
            params: {
                size: rows,
                page: pagina,
                notas: this.state.parametro.notas,
                dataDe: this.state.parametro.dataDe,
                evento: this.state.parametro.evento,
                empresa: this.state.parametro.empresa,
                dataAte: this.state.parametro.dataAte,
                periodo: this.state.parametro.periodo,
                usuario: this.state.parametro.usuario,
                departamento: this.state.parametro.departamento,
                tipoDesconto: this.state.parametro.tipoDesconto,
                nomeFuncionario: this.state.parametro.nomeFuncionario,
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

    impressao = async (value) => {
        Loading.onShow();

        let ID = [];

        ID.push(parseInt(value));

        await Api({
            method: 'post',
            url: `${url}/PDF`,
            data: { ID },
            responseType: 'blob',
        }).then(resp => {
            Loading.onHide();
            saveFile(resp.data, 'notas.pdf');
            Toasty.success('Sucesso', 'Impressão gerada com sucesso!');
        })
            .catch(error => {
                ErrorHandler(error);
                Loading.onHide();
            })
    }

    impressaoLista = async () => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}?PDF`,
            params: this.state.parametro,
            responseType: 'blob',
        }).then(resp => {
            Loading.onHide();
            saveFile(resp.data, 'notas.pdf');
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
            params: this.state.parametro,
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

    validFuncionario() {
        if (this.state.funcionario !== null && this.state.funcionario !== undefined) {
            if (this.state.funcionario.id !== null && this.state.funcionario.id !== undefined) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validPeriodo() {
        if (this.state.nota.periodo !== null && this.state.nota.periodo !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    validEvento() {
        if (this.state.nota.evento !== null && this.state.nota.evento !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    validTipoDesconto() {
        if (this.state.nota.tipoDesconto !== null && this.state.nota.tipoDesconto !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    validParcela() {
        if (this.state.nota.parcela >= 1 && this.state.nota.parcela <= 99) {
            return true;
        } else {
            return false;
        }
    }

    validaValor() {
        try {
            var value = this.state.valor;
            value.split('R$ ').join('');
            var numsStr = value.replace(/[^0-9]/g, '');
            return parseInt(Math.abs(numsStr)) > 0;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    validaGeracaoNota() {
        if (this.validEvento() && this.validFuncionario() &&
            this.validParcela() && this.validPeriodo() &&
            this.validTipoDesconto() && this.validaValor()) {
            return true;
        } else {
            return false;
        }
    }

    validaEdicao() {
        try {
            var value = String(this.state.notaEditar.valorNota);
            value.split('R$ ').join('');
            var numsStr = value.replace(/[^0-9]/g, '');
            return parseInt(Math.abs(numsStr)) > 0;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    formataData(value) {
        return moment(value, 'YYYY-MM-DD');
    }

    formataMoney(notas) {
        for (const x of notas) {
            x.valor = x.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }
    }

    mascaraMoney(value) {
        return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }

    onPage(event) {
        this.pesquisarNotas(event.page, event.rows, event.first).then(
            this.setState({ first: event.first, rows: event.rows, page: event.page })
        );
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
                onClick={() => this.editarNota(rowData.id)}
                disabled={!temQualquerPermissao(['ROLE_DEPTO'])}
            />
            <Button
                type='button'
                tooltip='Excluir'
                icon='pi pi-trash'
                className='p-button-danger'
                style={{ marginRight: '.5em' }}
                tooltipOptions={{ position: 'top' }}
                disabled={!temQualquerPermissao(['ROLE_DEPTO'])}
                onClick={() => this.confirmacaoExcluir(rowData.id)}
            />
            <Button
                type='button'
                tooltip='Imprimir'
                icon='pi pi-print'
                className='p-button-success'
                tooltipOptions={{ position: 'top' }}
                onClick={() => this.impressao(rowData.id)}
            />
        </div>;
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
                            <TabView activeIndex={this.state.activeIndex} onTabChange={(e) => this.setState({ activeIndex: e.index })}>
                                <TabPanel disabled header='Lista'>
                                    <div className='p-grid'>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data de</label>
                                            <InputMask
                                                mask='99/99/9999'
                                                value={this.state.parametro.dataDe}
                                                onChange={(e) => this.setState({ parametro: { ...this.state.parametro, dataDe: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data até</label>
                                            <InputMask
                                                mask='99/99/9999'
                                                value={this.state.parametro.dataAte}
                                                onChange={(e) => this.setState({ parametro: { ...this.state.parametro, dataAte: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Departamento</label>
                                            <Dropdown
                                                showClear={true}
                                                options={departamentosPesquisa}
                                                value={this.state.parametro.departamento}
                                                onChange={(e) => { this.onChangeDepartamentoPesquisa(e) }}
                                                disabled={!temQualquerPermissao(['ROLE_ADMIN', 'ROLE_RH'])}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Usuário</label>
                                            <Dropdown
                                                showClear={true}
                                                options={usuarios}
                                                value={this.state.parametro.usuario}
                                                onChange={(e) => this.setState({ parametro: { ...this.state.parametro, usuario: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Desconto</label>
                                            <Dropdown
                                                filter={true}
                                                showClear={true}
                                                filterBy='label,value'
                                                options={tipoDescontosPesquisa}
                                                value={this.state.parametro.tipoDesconto}
                                                filterPlaceholder='Pesquisar tipo desconto'
                                                onChange={(e) => this.setState({ parametro: { ...this.state.parametro, tipoDesconto: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Período</label>
                                            <Dropdown
                                                showClear={true}
                                                options={periodosPesquisa}
                                                value={this.state.parametro.periodo}
                                                filter={true} filterPlaceholder='Pesquisar período' filterBy='label,value'
                                                onChange={(e) => this.setState({ parametro: { ...this.state.parametro, periodo: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Evento</label>
                                            <Dropdown
                                                showClear={true}
                                                options={eventosPesquisa}
                                                value={this.state.parametro.evento}
                                                filter={true} filterPlaceholder='Pesquisar evento' filterBy='label,value'
                                                onChange={(e) => this.setState({ parametro: { ...this.state.parametro, evento: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nota(s)</label>
                                            <InputText
                                                keyfilter={/[0-9,]+$/}
                                                value={this.state.parametro.notas}
                                                placeholder={'separadas por vírgula 1,2,3'}
                                                onChange={(e) => this.setState({ parametro: { ...this.state.parametro, notas: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Funcionário</label>
                                            <InputText
                                                value={this.state.parametro.nomeFuncionario}
                                                onChange={(e) => this.setState({ parametro: { ...this.state.parametro, nomeFuncionario: e.target.value.toUpperCase() } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <Button
                                                label='Pesquisar'
                                                icon='pi pi-search'
                                                onClick={() => this.pesquisarNotas()}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <Button
                                                label='Adicionar'
                                                icon='pi pi-plus'
                                                className='p-button-success'
                                                onClick={() => this.inserirNota()}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-1' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <Button
                                                tooltip='XLS'
                                                icon='pi pi-external-link'
                                                className='p-button-warning'
                                                onClick={() => this.exportarXLS()}
                                                tooltipOptions={{ position: 'top' }}
                                                disabled={this.state.lista.length === 0}
                                                style={{ marginRight: '.3em', width: '50%' }}
                                            />
                                            <Button
                                                icon='pi pi-print'
                                                style={{ width: '50%' }}
                                                tooltip='Imp. Lista'
                                                className='p-button-success'
                                                tooltipOptions={{ position: 'top' }}
                                                onClick={() => this.impressaoLista()}
                                                disabled={this.state.lista.length === 0}
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
                                                emptyMessage={'Nenhum registro encontrado!'}
                                                rowsPerPageOptions={[5, 10, 20, 50, 100, 500]}
                                            >
                                                <Column field='id' header='Nota' style={{ width: '6em' }} />
                                                <Column field='parcela' style={{ width: '10em' }} header='Parcela' />
                                                <Column field='data' style={{ width: '12em' }} header='Emissão' />
                                                <Column field='funcionario' header='Funcionário' />
                                                <Column field='periodo' header='Período' />
                                                <Column field='valor' style={{ width: '8em' }} header='Valor' />
                                                <Column body={this.acoesTabela} style={{ textAlign: 'center', width: '10em' }} />
                                            </DataTable>
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel disabled header='Editar nota'>
                                    <div className='p-grid'>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nota</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.notaEditar.id}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-7'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Usuário</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.notaEditar.usuario.nome}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data emissão</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.notaEditar.dataNota}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-7'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Empresa</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.notaEditar.empresa.nomeEmpresa}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-5'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Unidade</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.notaEditar.funcionario.filial.nome}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Evento</label>
                                            <Dropdown
                                                options={eventos}
                                                value={this.state.notaEditar.evento.id}
                                                onChange={(e) => this.setState({ notaEditar: { ...this.state.notaEditar, evento: { id: e.value } } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo desconto</label>
                                            <Dropdown
                                                options={tipoDescontos}
                                                value={this.state.notaEditar.tipoDesconto.id}
                                                filter={true} filterPlaceholder='Pesquisar tipo desconto' filterBy='label,value'
                                                onChange={(e) => this.setState({ notaEditar: { ...this.state.notaEditar, tipoDesconto: { id: e.value } } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-5'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Período</label>
                                            <Dropdown
                                                options={periodos}
                                                value={this.state.notaEditar.periodo.id}
                                                onChange={(e) => this.setState({ notaEditar: { ...this.state.notaEditar, periodo: { id: e.value } } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cracha</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.notaEditar.funcionario.cracha}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-5'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Funcionário</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.notaEditar.funcionario.nomeFuncionario}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Parcela</label>
                                            <InputText
                                                disabled={true}
                                                value={this.state.notaEditar.numeroParcela}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor</label>
                                            <InputText
                                                value={this.state.notaEditar.valorNota}
                                                onChange={(e) => this.setState({ notaEditar: { ...this.state.notaEditar, valorNota: formatMoney(e.target.value) } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <Button
                                                label='Salvar'
                                                icon='pi pi-check'
                                                disabled={!this.validaEdicao()}
                                                onClick={() => this.salvarNota()}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <Button
                                                label='Cancelar'
                                                icon='pi pi-times'
                                                className='p-button-danger'
                                                onClick={() => this.setState({ activeIndex: 0 })}
                                            />
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel disabled header='Gerar nota'>
                                    <div className='p-grid'>
                                        <div className='p-col-12 p-md-12'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Departamento</label>
                                            <Dropdown
                                                showClear={true}
                                                options={departamentos}
                                                value={this.state.departamento}
                                                onChange={(e) => this.onChangeDepartamento(e)}
                                                disabled={!temQualquerPermissao(['ROLE_ADMIN', 'ROLE_RH'])}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-12'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Empresa</label>
                                            <Dropdown
                                                showClear={true}
                                                options={empresas}
                                                value={this.state.empresa}
                                                onChange={(e) => this.onChangeEmpresa(e)}
                                                filter={true} filterPlaceholder='Pesquisar empresa' filterBy='label,value'
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-12'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Período</label>
                                            <Dropdown
                                                showClear={true}
                                                options={periodos}
                                                value={this.state.nota.periodo}
                                                filter={true} filterPlaceholder='Pesquisar período' filterBy='label,value'
                                                onChange={(e) => this.setState({ nota: { ...this.state.nota, periodo: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-12'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Tipo Desconto</label>
                                            <Dropdown
                                                showClear={true}
                                                options={tipoDescontos}
                                                disabled={!this.state.departamento}
                                                value={this.state.nota.tipoDesconto}
                                                filter={true} filterPlaceholder='Pesquisar tipo desconto' filterBy='label,value'
                                                onChange={(e) => this.setState({ nota: { ...this.state.nota, tipoDesconto: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-12'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Evento</label>
                                            <Dropdown
                                                showClear={true}
                                                options={eventos}
                                                disabled={!this.state.empresa}
                                                value={this.state.nota.evento}
                                                filter={true} filterPlaceholder='Pesquisar evento' filterBy='label,value'
                                                onChange={(e) => this.setState({ nota: { ...this.state.nota, evento: e.target.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Qtd. parcela(s)</label>
                                            <InputText
                                                min={1}
                                                max={99}
                                                required
                                                maxLength={2}
                                                type={'number'}
                                                value={this.state.nota.parcela}
                                                onChange={(e) => this.setState({ nota: { ...this.state.nota, parcela: e.target.value.toUpperCase() } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor</label>
                                            <InputText
                                                value={this.state.valor}
                                                onChange={(e) => this.setState({ valor: formatMoney(e.target.value) })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-8'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Funcionário</label>
                                            <AutoComplete
                                                minLength={3}
                                                field={'nomeFuncionario'}
                                                disabled={!this.state.empresa}
                                                value={this.state.funcionario}
                                                suggestions={this.state.funcionarios}
                                                completeMethod={this.procurarFuncionario.bind(this)}
                                                onChange={(e) => this.setState({ funcionario: e.value })}
                                            />
                                        </div>
                                        <div className='p-md-3' style={{ padding: 0 }}></div>
                                        <div className='p-col-12 p-md-2'>
                                            <Button
                                                label='Gerar'
                                                icon='pi pi-cog'
                                                onClick={() => this.gerarNota()}
                                                disabled={!this.validaGeracaoNota()}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <Button
                                                label='Limpar'
                                                icon='pi pi-circle-off'
                                                className='p-button-secondary'
                                                onClick={() => this.limpar()}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <Button
                                                label='Cancelar'
                                                icon='pi pi-plus'
                                                className='p-button-danger'
                                                onClick={() => this.setState({ activeIndex: 0 })}
                                            />
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

export default withRouter(FaturamentoView);     