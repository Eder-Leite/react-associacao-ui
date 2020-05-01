import Loading from '../loading';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import React, { Component } from 'react';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { withRouter } from 'react-router-dom';
import ErrorHandler from '../../services/ErrorHandler';
import Api, { getProfile, temPermissao } from '../../services/Api';

function DashboardTop() {
    this.ordem = undefined;
    this.titulo = 'Titulo';
    this.descricao = 'descrição';
    this.valor = 'valor';
}

function GraficoNota() {
    this.tipoPesquisa = 0;
    this.numeroDeDias = 7;
    this.usuario = getProfile().usuario;
}

function DataBar() {
    this.labels = [];
    this.datasets = [];
}

var bar = [];
var barAno = [];

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataBar: new DataBar(),
            nota: new DashboardTop(),
            usuario: new DashboardTop(),
            filtroNota: new GraficoNota(),
            totalNotaPorAno: new DataBar(),
            funcionario: new DashboardTop(),

        }
        Loading.onShow();

        //  console.log(window.innerWidth);
        //  console.log(window.innerHeight);

        document.title = 'Evolution Sistemas - Associação | Dashboard';
    }

    locale() {
        var calendar = document.getElementById('calendar');
        console.log(calendar);
    }

    componentDidMount() {
        setTimeout(() => {
            this.locale();
            Loading.onHide();
            this._dataBar();
            this._dashboardTop();
            this._dashboardTotalPorAno();
        }, 300);
    }

    _dashboardTop = async () => {
        Loading.onShow();

        await Api({
            method: 'get',
            url: 'graficos?dashboardTop',
        }).then(resp => {
            Loading.onHide();
            this.setState({ usuario: resp.data[0], nota: resp.data[1], funcionario: resp.data[2] });
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    dashboardTotalPorAno = async () => {
        Loading.onShow();

        barAno = [];
        await Api({
            method: 'get',
            url: 'graficos?dashboardTotalPorAno',
        }).then(resp => {
            barAno = resp.data;
            Loading.onHide();
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    graficoNota = async () => {
        Loading.onShow();

        bar = [];
        await Api({
            method: 'get',
            url: 'graficos?nota',
            params: this.state.filtroNota,
        }).then(resp => {
            bar = resp.data;
            Loading.onHide();
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    _dataBar = async () => {
        await this.graficoNota();
        var datasets = [];
        var labels = [];
        var data = [];

        for (let index = 0; index < bar.length; index++) {
            labels.push(String(bar[index].data).substring(0, 5));
            data.push(bar[index].valor);
        }

        var usuario = {
            label: getProfile().nome,
            backgroundColor: '#42A5F5',
            fill: false,
            data: data
        };

        datasets.push(usuario);

        await this.setState({ filtroNota: { ...this.state.filtroNota, tipoPesquisa: 1 } });

        await this.graficoNota();

        data = [];

        for (let index = 0; index < bar.length; index++) {
            data.push(bar[index].valor);
        }

        var todosUuario = {
            label: 'OUTROS USUÁRIOS',
            backgroundColor: '#9CCC65',
            fill: false,
            data: data
        };

        datasets.push(todosUuario);

        await this.setState({
            dataBar: {
                labels,
                datasets
            }
        });
    }

    _dashboardTotalPorAno = async () => {
        await this.dashboardTotalPorAno();

        var datasets = [];
        var labels = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        var data = [];
        var titulo = '';

        for (let index = 0; index < barAno.length; index++) {
            titulo = barAno[0].ano;
            data = [barAno[0].mes1, barAno[0].mes2, barAno[0].mes3, barAno[0].mes4, barAno[0].mes5, barAno[0].mes6,
            barAno[0].mes7, barAno[0].mes8, barAno[0].mes9, barAno[0].mes10, barAno[0].mes11, barAno[0].mes12];
        }

        var ano1 = {
            label: titulo,
            backgroundColor: '#4CAF50',
            data: data,
            borderColor: 'white',
            borderWidth: 2
        };

        datasets.push(ano1);

        titulo = '';
        data = [];

        for (let index = 0; index < barAno.length; index++) {
            titulo = barAno[1].ano;
            data = [barAno[1].mes1, barAno[1].mes2, barAno[1].mes3, barAno[1].mes4, barAno[1].mes5, barAno[1].mes6,
            barAno[1].mes7, barAno[1].mes8, barAno[1].mes9, barAno[1].mes10, barAno[1].mes11, barAno[1].mes12];
        }

        var ano2 = {
            label: titulo,
            backgroundColor: '#FFC107',
            data: data,
            borderColor: 'white',
            borderWidth: 2
        };

        datasets.push(ano2);

        titulo = '';
        data = [];

        for (let index = 0; index < barAno.length; index++) {
            titulo = barAno[2].ano;
            data = [barAno[2].mes1, barAno[2].mes2, barAno[2].mes3, barAno[2].mes4, barAno[2].mes5, barAno[2].mes6,
            barAno[2].mes7, barAno[2].mes8, barAno[2].mes9, barAno[2].mes10, barAno[2].mes11, barAno[2].mes12];
        }

        var ano3 = {
            label: titulo,
            backgroundColor: '#FF0000',
            data: data,
            borderColor: 'white',
            borderWidth: 2
        };

        datasets.push(ano3);

        await this.setState({
            totalNotaPorAno: {
                labels,
                datasets
            }
        });
    }

    onClickMenu = (e) => {
        this.props.history.push({ pathname: e });
    }

    render() {

        const options = {
            responsive: true,
            title: {
                display: true,
                text: 'Quantidade de notas por Ano',
            },
            tooltips: {
                mode: 'index',
                intersect: true
            }
        };

        const multiAxisOptions = {
            title: {
                display: true,
                text: 'Notas emitidas no período abaixo'
            },
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            scales: {
                yAxes: [{
                    type: 'linear',
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                }, {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    id: 'y-axis-2',
                    gridLines: {
                        drawOnChartArea: false
                    }
                }]
            }
        }

        const botaoMenu = {
            textAlign: 'left',
            marginBottom: 10,
            backgroundColor: 'white',
        }

        return (
            <div style={{ padding: 10 }} className='p-grid p-fluid dashboard'>
                <div className='p-col-12 p-lg-4'>
                    <Card className='summary'>
                        <span className='title'>{this.state.usuario.titulo}</span>
                        <span className='detail'>{this.state.usuario.descricao}</span>
                        <span className='count visitors'>{this.state.usuario.valor}</span>
                    </Card>
                </div>
                <div className='p-col-12 p-lg-4'>
                    <Card className='summary'>
                        <span className='title'>{this.state.nota.titulo}</span>
                        <span className='detail'>{this.state.nota.descricao}</span>
                        <span className='count purchases'>{this.state.nota.valor}</span>
                    </Card>
                </div>
                <div className='p-col-12 p-lg-4'>
                    <Card className='summary'>
                        <span className='title'>{this.state.funcionario.titulo}</span>
                        <span className='detail'>{this.state.funcionario.descricao}</span>
                        <span className='count revenue'>{this.state.funcionario.valor}</span>
                    </Card>
                </div>
                <div className='p-col-12 p-lg-4'>
                    <Card>
                        <div style={{ minHeight: 360, maxHeight: 360 }}>
                            <Panel header='Atalhos'>
                                <Button
                                    style={botaoMenu}
                                    label='Arquivo Folha'
                                    icon='pi pi-external-link'
                                    className='p-button-secondary'
                                    disabled={!temPermissao('ROLE_RH')}
                                    onClick={() => this.onClickMenu('/app/arquivoFolha')}
                                />
                                <Button
                                    icon='pi pi-file'
                                    style={botaoMenu}
                                    label='Débitos Funcionário'
                                    className='p-button-secondary'
                                    disabled={!temPermissao('ROLE_RH')}
                                    onClick={() => this.onClickMenu('/app/debitoFuncionario')}
                                />
                                <Button
                                    icon='pi pi-cog'
                                    style={botaoMenu}
                                    label='Gerar Nota'
                                    className='p-button-secondary'
                                    disabled={!temPermissao('ROLE_USER')}
                                    onClick={() => this.onClickMenu('/app/faturamento')}
                                />
                                <Button
                                    icon='pi pi-file'
                                    style={botaoMenu}
                                    label='Posicão Sintética'
                                    className='p-button-secondary'
                                    disabled={!temPermissao('ROLE_ADMIN')}
                                    onClick={() => this.onClickMenu('/app/posicaoSintetica')}
                                />
                                <Button
                                    icon='pi pi-file'
                                    style={botaoMenu}
                                    label='Relátorio Nota'
                                    className='p-button-secondary'
                                    disabled={!temPermissao('ROLE_USER')}
                                    onClick={() => this.onClickMenu('/app/relatorioNota')}
                                />
                                <Button
                                    icon='pi pi-cog'
                                    style={botaoMenu}
                                    label='Seguro Vida'
                                    className='p-button-secondary'
                                    disabled={!temPermissao('ROLE_RH')}
                                    onClick={() => this.onClickMenu('/app/seguroVida')}
                                />
                                <Button
                                    icon='pi pi-list'
                                    style={botaoMenu}
                                    label='Tipo Desconto'
                                    className='p-button-secondary'
                                    disabled={!temPermissao('ROLE_DEPTO')}
                                    onClick={() => this.onClickMenu('/app/tipoDesconto')}
                                />
                            </Panel>
                        </div>
                    </Card>
                </div>
                <div className='p-col-12 p-lg-8'>
                    <Card>
                        <div style={{ minHeight: 360 }}>
                            <Chart
                                type='line'
                                data={this.state.dataBar}
                                options={multiAxisOptions}
                            />
                        </div>
                    </Card>
                </div>
                <div className='p-col-12 p-lg-12'>
                    <Card>
                    </Card>
                </div>
                <div className='p-col-12 p-lg-12'>
                    <Card>
                        <Chart
                            type='bar'
                            options={options}
                            data={this.state.totalNotaPorAno}
                        />
                    </Card>
                </div>
            </div >
        );
    }
}

export default withRouter(Dashboard);