import Toasty from '../toasty';
import Loading from '../loading';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { Toolbar } from 'primereact/toolbar';
import { withRouter } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { AutoComplete } from 'primereact/autocomplete';
import ErrorHandler from '../../services/ErrorHandler';
import { TabView, TabPanel } from 'primereact/tabview';
import { formatMoney } from '../../services/MaskMoney';
import confirmService from '../../services/confirmService';
import Api, { saveFile, getProfile } from '../../services/Api';

let url = 'seguros';
let empresas = [];
let periodos = [];

function Seguro() {
    this.id = undefined;
    this.funcionario = undefined;
    this.valor = 0;
}

function Filtro() {
    this.empresa = undefined;
    this.nomeFuncionario = undefined;
    this.cracha = undefined;
    this.valor = undefined;
}

function ProcessoSeguro() {
    this.acao = undefined;
    this.periodo = undefined;;
    this.departamento = parseInt(getProfile().departamento);
    this.usuario = parseInt(getProfile().usuario);
}

const acoes = [
    { label: 'GERAR PROCESSO', value: 'G' },
    { label: 'CANCELAR PROCESSO', value: 'C' }
];

class SeguroVidaView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: 5,
            page: 0,
            first: 0,
            lista: [],
            activeIndex: 0,
            totalRecords: 0,
            funcionarios: [],
            filtro: new Filtro(),
            seguro: new Seguro(),
            processo: new ProcessoSeguro(),
        };

        this.onPage = this.onPage.bind(this);
        this.acoesTabela = this.acoesTabela.bind(this);

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Seguro vida';
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
                size: 99999
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

    procurarFuncionario = async (event) => {

        await Api({
            method: 'get',
            url: 'funcionarios?resumo',
            params: {
                size: 99999,
                nomeFuncionario: event.query.toLowerCase()
            }
        }).then(resp => {
            const funcionarios = resp.data.content.map((e) => ({
                id: e.id,
                nomeFuncionario: `${e.nomeFuncionario} | ${e.cracha} | ${e.nomeEmpresa}`,
            }));

            this.setState({ funcionarios });
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
                cracha: this.state.filtro.cracha,
                empresa: this.state.filtro.empresa,
                nomeFuncionario: this.state.filtro.nomeFuncionario,
            }
        }).then(resp => {
            Loading.onHide();

            let x = resp.data.content;
            this.formataMoney(x);

            this.setState(
                {
                    first: first,
                    lista: x,
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

    manipulaProcessoSeguro = async () => {
        await this.pesquisarPeriodos();
        this.setState({ activeIndex: 2, processo: new ProcessoSeguro() });
    }

    formataMoney(value) {
        for (const x of value) {
            x.valor = x.valor.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        }
    }

    mascaraMoney(value) {
        return value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
    }

    valorDeSeguro(value) {
        var numsStr = value.replace(/[^0-9]/g, '');
        return parseInt(numsStr) / 100;
    }

    editar = async (value) => {
        await this.buscarSeguro(value);
        this.setState({ seguro: { ...this.state.seguro, valor: this.mascaraMoney(this.state.seguro.valor) } });
    }

    inserir = async () => {
        await this.setState({ activeIndex: 1, seguro: new Seguro() });
        this.setState({ seguro: { ...this.state.seguro, valor: this.mascaraMoney(this.state.seguro.valor) } });
    }

    onSelectFuncionario(event) {
        const funcionario = this.state.seguro.funcionario;
        funcionario.id = event.value.id;
        funcionario.nomeFuncionario = event.value.nomeFuncionario;
        this.setState({ seguro: { ...this.state.seguro, funcionario } })
    }

    onChangeFuncionario(event) {
        this.setState({ seguro: { ...this.state.seguro, funcionario: event.value } });
    }

    onPage(event) {
        this.pesquisar(event.page, event.rows, event.first).then(
            this.setState({ first: event.first, rows: event.rows, page: event.page })
        );
    }

    gerarProcessoSeguro = async () => {
        Loading.onShow();

        await Api({
            method: 'post',
            url: `${url}/processo`,
            data: JSON.stringify(this.state.processo)
        }).then(resp => {
            Loading.onHide();
            this.setState({ activeIndex: 0 });
            Toasty.success('Sucesso!', 'Ação do processo de seguro realizado com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    buscarSeguro = async (value) => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: `${url}/${value}`
        }).then(resp => {
            Loading.onHide();
            this.setState({ activeIndex: 1, seguro: resp.data });
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    editarSeguro = async (value) => {
        Loading.onShow();

        await Api({
            method: 'put',
            url: `${url}/${value}`,
            data: JSON.stringify(this.state.seguro)
        }).then(resp => {
            Loading.onHide();
            this.pesquisar();
            this.setState({ activeIndex: 0 });
            Toasty.success('Sucesso!', 'Seguro editado com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    inserirSeguro = async () => {
        Loading.onShow();

        await Api({
            method: 'post',
            url: url,
            data: JSON.stringify(this.state.seguro)
        }).then(resp => {
            Loading.onHide();
            this.pesquisar();
            this.setState({ activeIndex: 0 });
            Toasty.success('Sucesso!', 'Seguro inserido com sucesso!');
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
            saveFile(resp.data, 'seguros.xls');
            Toasty.success('Sucesso', 'XLS gerado com sucesso!');
        })
            .catch((e) => {
                ErrorHandler(e);
                Loading.onHide();
            })
    }

    salvarSeguro = async () => {
        await this.setState({ seguro: { ...this.state.seguro, valor: this.valorDeSeguro(this.state.seguro.valor) } });

        try {
            if (this.state.seguro.id !== null && this.state.seguro.id !== undefined) {
                this.editarSeguro(this.state.seguro.id);
            } else {
                this.inserirSeguro();
            }
        } catch (error) {
            console.log(error);
        }
    }

    validaFuncionario() {
        if (this.state.seguro.funcionario !== null && this.state.seguro.funcionario !== undefined) {
            if (this.state.seguro.funcionario.nomeFuncionario !== null && this.state.seguro.funcionario.nomeFuncionario !== undefined) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validaValor() {
        try {
            var value = String(this.state.seguro.valor);
            var numsStr = value.replace(/[^0-9]/g, '');
            return parseInt(Math.abs(numsStr)) > 0;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    validaFormulario() {
        if (this.validaValor() && this.validaFuncionario()) {
            return true;
        } else {
            return false;
        }
    }

    validaProcessoSeguro() {
        if (this.state.processo.acao !== undefined && this.state.processo.acao !== null &&
            this.state.processo.periodo !== undefined && this.state.processo.periodo !== null) {
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
                onClick={() => this.editar(rowData.id)}
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
        var footer = 'Quantidade de registros ' + this.state.totalRecords;

        var header =
            <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>
                Lista de seguros
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
                                                style={{ marginRight: '.50em' }}
                                                onClick={() => this.pesquisar()}
                                                tooltipOptions={{ position: 'left' }}
                                            />
                                            <Button
                                                icon='pi pi-cog'
                                                tooltip='Processo'
                                                className='p-button-success'
                                                style={{ marginRight: '.50em' }}
                                                tooltipOptions={{ position: 'left' }}
                                                onClick={() => this.manipulaProcessoSeguro()}
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
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Cracha</label>
                                            <InputText
                                                maxLength={7}
                                                keyfilter={/[0-9]+$/}
                                                value={this.state.filtro.cracha}
                                                onChange={(e) => this.setState({ filtro: { ...this.state.filtro, cracha: e.target.value } })}
                                            />
                                        </div>
                                        <div style={{ padding: 0 }} className='p-md-10'></div>
                                        <div className='p-col-12 p-md-4'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome</label>
                                            <InputText
                                                value={this.state.filtro.nomeFuncionario}
                                                onChange={(e) => this.setState({ filtro: { ...this.state.filtro, nomeFuncionario: e.target.value.toUpperCase() } })}
                                            />
                                        </div>
                                        <div style={{ padding: 0 }} className='p-col-12 p-md-8'></div>
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
                                            <Column field='valor' header='Valor' style={{ width: '8em' }} />
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
                                                value={this.state.seguro.id}
                                            />
                                        </div>
                                        <div style={{ padding: 0 }} className='p-md-10'></div>
                                        <div className='p-col-12 p-md-6'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Funcionário</label>
                                            <AutoComplete
                                                minLength={3}
                                                field={'nomeFuncionario'}
                                                suggestions={this.state.funcionarios}
                                                //  onUnselect={(e) => console.log(e)}
                                                //   onSelect={this.onSelectFuncionario.bind(this)}
                                                onChange={this.onChangeFuncionario.bind(this)}
                                                completeMethod={this.procurarFuncionario.bind(this)}
                                                value={this.state.seguro.funcionario}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Valor</label>
                                            <InputText
                                                value={this.state.seguro.valor}
                                                onChange={(e) => this.setState({ seguro: { ...this.state.seguro, valor: formatMoney(e.target.value) } })}
                                            />
                                        </div>
                                        <div style={{ padding: 0 }} className='p-md-4'></div>
                                        <div className='p-col-12 p-md-12'>
                                            <Toolbar>
                                                <div className='p-toolbar-group-left'>
                                                    <Button
                                                        label='Salvar'
                                                        icon='pi pi-check'
                                                        disabled={!this.validaFormulario()}
                                                        onClick={() => this.salvarSeguro()}
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
                                <TabPanel disabled header='Processo'>
                                    <div className='p-grid'>
                                        <div className='p-col-12 p-md-3'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Ação</label>
                                            <Dropdown
                                                options={acoes}
                                                value={this.state.processo.acao}
                                                onChange={(e) => this.setState({ processo: { ...this.state.processo, acao: e.value } })}
                                            />
                                        </div>
                                        <div style={{ padding: 0 }} className='p-md-9'></div>
                                        <div className='p-col-12 p-md-5'>
                                            <label htmlFor='in' style={{ fontWeight: 'bold' }}>Período</label>
                                            <Dropdown
                                                options={periodos}
                                                value={this.state.processo.periodo}
                                                onChange={(e) => this.setState({ processo: { ...this.state.processo, periodo: e.value } })}
                                            />
                                        </div>
                                        <div className='p-col-12 p-md-2' style={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <Button
                                                label='Executar'
                                                icon='pi pi-check'
                                                disabled={!this.validaProcessoSeguro()}
                                                onClick={() => this.gerarProcessoSeguro()}
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
                            </TabView>
                        </Card>
                    </div>
                </div >
            </div >
        );
    }
}

export default withRouter(SeguroVidaView);