import Toasty from '../toasty';
import Loading from '../loading';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { withRouter } from 'react-router-dom';
import { Dropdown } from 'primereact/dropdown';
import { Password } from 'primereact/password';
import { ApiCadastro } from '../../services/Api';
import { InputText } from 'primereact/inputtext';
import ErrorHandler from '../../services/ErrorHandler';

const url = 'usuarios';

function Filtro() {
    this.departamento = undefined;
    this.nome = '';
    this.email = '';
    this.senha = '';
}

class CadastroView extends Component {

    constructor(props) {
        super(props);

        this.state = {
            departamentos: [],
            cadastro: new Filtro(),
        }

        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Cadastro';
    }

    componentDidMount() {
        setTimeout(() => {
            this.pesquisaDepartamentos();
        }, 300);
    }

    IsEmail() {
        if (new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(this.state.cadastro.email)) {
            return true;
        }
        else {
            return false;
        }
    }

    isSenha() {
        if (this.state.cadastro.senha !== undefined && this.state.cadastro.senha !== null) {
            if (this.state.cadastro.senha.length === 8) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    isDominio = () => {
        if (this.state.cadastro.email !== null && this.state.cadastro.email !== undefined) {
            if (this.state.cadastro.email.includes('@novaprodutiva.com.br')) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    isDepartamento = () => {
        if (this.state.cadastro.departamento !== null && this.state.cadastro.departamento !== undefined) {
            return true;
        } else {
            return false;
        }
    }

    isNomeCompelto = () => {
        if (this.state.cadastro.nome !== null && this.state.cadastro.nome !== undefined) {
            if (this.state.cadastro.nome.length > 5) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    validaFormulario = () => {
        if (this.IsEmail() &&
            this.isSenha() &&
            this.isDominio() &&
            this.isDepartamento() &&
            this.isNomeCompelto()) {
            return true;
        } else {
            return false;
        }
    }

    pesquisaDepartamentos = async () => {
        Loading.onShow();

        await ApiCadastro({
            method: 'get',
            url: `${url}/departamentoCadastro`,
        }).then(resp => {
            Loading.onHide();

            const data = resp.data.content.map((e) => ({
                value: e.id,
                label: e.nome
            }));

            this.setState({ departamentos: data });
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            });
    }

    cadastrarSe = async () => {
        Loading.onShow();

        await ApiCadastro({
            method: 'post',
            url: `${url}/cadastrarSe`,
            data: JSON.stringify(this.state.cadastro),
        }).then(resp => {
            Loading.onHide();
            this.props.history.push('/');
            Toasty.success('Sucesso!', 'Cadastro criado com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            });
    }

    render() {

        const style = {
            width: '100vw',
            height: '100vh',
            background: '#6C7A89',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }

        return (
            <div style={style}>

                <div>
                    <img
                        alt='Logo'
                        style={{ marginBottom: 25 }}
                        src='../assets/images/logoEvolution.png'
                    />
                </div>

                <Card className='card-login'>
                    <div className='content-section implementation'>
                        <h2 style={{ textAlign: 'center', margin: 15, fontWeight: 'bold' }} className='first'>CADASTRO</h2>
                        <div style={{ marginTop: 0 }} className='p-grid'>
                            <div className='p-col-12 p-md-12'>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        <i className='pi pi-list'></i>
                                    </span>
                                    <Dropdown
                                        showClear={true}
                                        style={{ width: '100vw' }}
                                        placeholder='Departamento'
                                        options={this.state.departamentos}
                                        value={this.state.cadastro.departamento}
                                        onChange={(e) => this.setState({ cadastro: { ...this.state.cadastro, departamento: e.value } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 5 }} className='p-grid p-fluid'>
                            <div className='p-col-12 p-md-12'>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        <i className='pi pi-user'></i>
                                    </span>
                                    <InputText
                                        type='text'
                                        maxLength={255}
                                        placeholder='Nome completo'
                                        value={this.state.cadastro.nome}
                                        onChange={(e) => this.setState({ cadastro: { ...this.state.cadastro, nome: e.target.value.toUpperCase() } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 5 }} className='p-grid p-fluid'>
                            <div className='p-col-12 p-md-12'>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        <i className='pi pi-envelope'></i>
                                    </span>
                                    <InputText
                                        type='email'
                                        maxLength={255}
                                        placeholder='Email'
                                        value={this.state.cadastro.email}
                                        onChange={(e) => this.setState({ cadastro: { ...this.state.cadastro, email: e.target.value.toLowerCase() } })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: 5 }} className='p-grid p-fluid'>
                            <div className='p-col-12 p-md-12'>
                                <div className='p-inputgroup'>
                                    <span className='p-inputgroup-addon'>
                                        <i className='pi pi-lock'></i>
                                    </span>
                                    <Password
                                        maxLength={8}
                                        placeholder='Senha'
                                        keyfilter={/[0-9]+$/}
                                        value={this.state.cadastro.senha}
                                        weakLabel={'Atenção a senha digitada é fraca'}
                                        mediumLabel={'Atenção a senha digitada é razoável'}
                                        strongLabel={'Atenção a senha digitada é excelente'}
                                        onChange={(e) => this.setState({ cadastro: { ...this.state.cadastro, senha: e.target.value } })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 20, justifyContent: 'center', alignItems: 'center' }} className='p-fluid'>
                        <Button disabled={!this.validaFormulario()} onClick={() => this.cadastrarSe()} label='ENVIAR CADASTRO' />
                    </div>

                    <div style={{ marginTop: 40, textAlign: 'center', fontSize: 11, color: 'blue', fontWeight: 'bold' }} className='p-col-12 p-md-12'>
                        <span>Cadastro apenas para o domínio @novaprodutiva.com.br</span>
                    </div>
                </Card>
            </div>
        );
    }
}

export default withRouter(CadastroView);    