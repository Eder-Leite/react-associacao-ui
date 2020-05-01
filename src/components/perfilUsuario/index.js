import Toasty from '../toasty';
import Loading from '../loading';
import { Card } from 'primereact/card';
import React, { Component } from 'react';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { withRouter } from 'react-router-dom';
import { Password } from 'primereact/password';
import { DataTable } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import Api, { getProfile } from '../../services/Api';
import ErrorHandler from '../../services/ErrorHandler';

import { PerfilUsuario } from '../Model';

let url = 'usuarios';

function Filtro() {
    this.id = parseInt(getProfile().usuario);
    this.senhaAntiga = '';
    this.senhaNova = '';
    this.confirmaSenha = '';
}
class PerfilUsuarioView extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filtro: new Filtro(),
            usuario: new PerfilUsuario(),
        }
        Loading.onShow();

        document.title = 'Evolution Sistemas - Associação | Perfil usuário';
    }

    componentDidMount() {
        setTimeout(() => {
            this.buscarUsuario();
        }, 300);
    }

    buscarUsuario = async () => {

        await Api({
            method: 'get',
            url: `${url}?perfil`,
            params: {
                id: getProfile().usuario
            }
        }).then(resp => {
            Loading.onHide();
            this.setState({ usuario: resp.data });
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    alterarSenha = async () => {
        Loading.onShow();

        const { id, senhaAntiga, senhaNova } = this.state.filtro;const data = { id, senhaAntiga, senhaNova };

        await Api({
            method: 'post',
            url: `${url}/alteraSenha`,
            data: JSON.stringify(data),
        }).then(resp => {
            Loading.onHide();
            this.setState({ filtro: new Filtro() });
            Toasty.success('Sucesso!', 'Senha alterada com sucesso!');
        })
            .catch(error => {
                Loading.onHide();
                ErrorHandler(error);
            })
    }

    validaSenha() {
        if (this.state.filtro.senhaAntiga.length === 8) {
            if (this.state.filtro.senhaNova.length === 8 && this.state.filtro.senhaNova === this.state.filtro.confirmaSenha) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    limpaSenha() {
        this.setState({ filtro: new Filtro() });
    }

    render() {
        var header = <div className='p-clearfix' style={{ lineHeight: '1.87em' }}>Lista de permissões</div>;

        return (
            <div className='p-fluid'>
                <div className='p-grid'>
                    <div className='p-col-12 p-md-8'>
                        <Card title='Perfil usuário'>
                            <div className='p-grid'>
                                <div className='p-col-12 p-md-3'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Código</label>
                                    <InputText
                                        readOnly={true}
                                        value={this.state.usuario.id}
                                    />
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Departamento</label>
                                    <InputText
                                        readOnly={true}
                                        value={this.state.usuario.departamento}
                                    />
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Nome</label>
                                    <InputText
                                        readOnly={true}
                                        value={this.state.usuario.nome}
                                    />
                                </div>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Email</label>
                                    <InputText
                                        readOnly={true}
                                        value={this.state.usuario.email}
                                    />
                                </div>
                                <div className='p-col-12 p-md-3'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Acessos</label>
                                    <InputText
                                        readOnly={true}
                                        value={this.state.usuario.quantidadeAcesso}
                                    />
                                </div>
                                <div className='p-col-12 p-md-3'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Último acesso</label>
                                    <InputText
                                        readOnly={true}
                                        value={this.state.usuario.dataUltimoAcesso}
                                    />
                                </div>
                                <div className='p-col-12 p-md-3'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Status</label>
                                    <InputText
                                        readOnly={true}
                                        value={this.state.usuario.status}
                                    />
                                </div>
                                <div className='p-col-12 p-md-3'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Data cadastro</label>
                                    <InputText
                                        readOnly={true}
                                        value={this.state.usuario.dataCadastro}
                                    />
                                </div>
                            </div>

                            <div className='content-section implementation'>
                                <DataTable
                                    rows={3}
                                    header={header}
                                    paginator={true}
                                    responsive={true}
                                    style={{ marginTop: 10 }}
                                    value={this.state.usuario.permissoes}
                                    rowsPerPageOptions={[3, 5, 10, 20, 50, 100]}
                                    emptyMessage={'Nenhum registro encontrado!'}
                                >
                                    <Column field='id' header='Código' style={{ width: '6em' }} />
                                    <Column field='descricao' header='Descrição' />
                                </DataTable>
                            </div>
                        </Card>
                    </div>

                    <div className='p-col-12 p-md-4'>
                        <Card className='p-col-12 p-md-12' title='Alteração de senha'>
                            <div className='p-grid'>
                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Senha antiga</label>
                                    <Password
                                        maxLength={8}
                                        feedback={false}
                                        keyfilter={/[0-9]+$/}
                                        value={this.state.filtro.senhaAntiga}
                                        onChange={(e) => this.setState({ filtro: { ...this.state.filtro, senhaAntiga: e.target.value } })}
                                    />
                                </div>

                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Senha nova</label>
                                    <Password
                                        maxLength={8}
                                        keyfilter={/[0-9]+$/}
                                        value={this.state.filtro.senhaNova}
                                        weakLabel={'Atenção a senha digitada é fraca'}
                                        mediumLabel={'Atenção a senha digitada é razoável'}
                                        strongLabel={'Atenção a senha digitada é excelente'}
                                        onChange={(e) => this.setState({ filtro: { ...this.state.filtro, senhaNova: e.target.value } })}
                                    />
                                </div>

                                <div className='p-col-12 p-md-12'>
                                    <label htmlFor='in' style={{ fontWeight: 'bold' }}>Confirma senha</label>
                                    <Password
                                        maxLength={8}
                                        feedback={false}
                                        keyfilter={/[0-9]+$/}
                                        value={this.state.filtro.confirmaSenha}
                                        onChange={(e) => this.setState({ filtro: { ...this.state.filtro, confirmaSenha: e.target.value } })}
                                    />
                                </div>
                                <div className='p-col-12 p-md-6'>
                                    <Button
                                        label='Enviar'
                                        icon='pi pi-check'
                                        className='p-button-rounded'
                                        readOnly={!this.validaSenha()}
                                        onClick={() => this.alterarSenha()}
                                    />
                                </div>
                                <div className='p-col-12 p-md-6'>
                                    <Button
                                        label='Limpar'
                                        icon='pi pi-circle-off'
                                        onClick={() => this.limpaSenha()}
                                        className='p-button-rounded p-button-secondary'
                                    />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(PerfilUsuarioView);