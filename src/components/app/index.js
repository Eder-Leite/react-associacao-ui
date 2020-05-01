import Footer from '../footer';
import Filial from '../filial';
import Evento from '../evento';
import Periodo from '../periodo';
import Empresa from '../empresa';
import Usuario from '../usuario';
import Sidebar from '../sidebar';
import { Topbar } from '../topbar';
import classNames from 'classnames';
import Dashboard from '../dashboard';
import SeguroVida from '../seguroVida';
import Faturamento from '../faturamento';
import Funcionario from '../funcionario';
import React, { Component } from 'react';
import TipoDesconto from '../tipoDesconto';
import Departamento from '../departamento';
import PerfilUsuario from '../perfilUsuario';
import ArquivoFolha from '../relatorios/ArquivoFolha';
import RelatorioNota from '../relatorios/RelatorioNota';
import PaginaNaoEncontrada from './PaginaNaoEncontrada'
import PosicaoSintetica from '../relatorios/PosicaoSintetica';
import DebitoFuncionario from '../relatorios/DebitoFuncionario';
import { Route, Switch, Redirect, withRouter } from 'react-router-dom';

import Calendario from '../calendario';

import { temQualquerPermissao } from '../../services/Api';

const PrivateRoute = ({ roles, component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props => (
            temQualquerPermissao(roles) ? (
                <Component {...props} />
            ) : (
                    <Redirect to={{ pathname: '/acessoNegado', state: { from: props.location } }} />
                )
        )} />
);

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            layoutMode: 'static',
            layoutColorMode: 'dark',
            staticMenuInactive: false,
            overlayMenuActive: false,
            mobileMenuActive: false
        };
        this.onToggleMenu = this.onToggleMenu.bind(this);
        this.onWrapperClick = this.onWrapperClick.bind(this);
    }

    addClass(element, className) {
        if (element.classList)
            element.classList.add(className);
        else
            element.className += ' ' + className;
    }

    removeClass(element, className) {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

    componentDidMount() {
    }

    componentDidUpdate() {
        if (this.state.mobileMenuActive) {
            this.addClass(document.body, 'body-overflow-hidden');
        }
        else {
            this.removeClass(document.body, 'body-overflow-hidden');
        }
    }

    onWrapperClick(event) {
        if (!Sidebar.prototype.isMenuClick()) {
            this.setState({ overlayMenuActive: false, mobileMenuActive: false });
        }
        Sidebar.prototype.onMenuClick(false);

        event.preventDefault();
    }

    onToggleMenu(event) {
        Sidebar.prototype.onMenuClick(true);

        if (window.innerWidth >= 1024) {

            if (this.state.layoutMode === 'overlay') {
                this.setState({
                    overlayMenuActive: !this.state.overlayMenuActive
                });
            }
            else if (this.state.layoutMode === 'static') {
                this.setState({
                    staticMenuInactive: !this.state.staticMenuInactive
                });
            }
        } else {
            const menuActive = this.state.mobileMenuActive;
            this.setState({ mobileMenuActive: !menuActive });
        }
        event.preventDefault();
    }

    render() {

        let wrapperClass = classNames('layout-wrapper', {
            'layout-overlay': this.state.layoutMode === 'overlay',
            'layout-static': this.state.layoutMode === 'static',
            'layout-static-sidebar-inactive': this.state.staticMenuInactive && this.state.layoutMode === 'static',
            'layout-overlay-sidebar-active': this.state.overlayMenuActive && this.state.layoutMode === 'overlay',
            'layout-mobile-sidebar-active': this.state.mobileMenuActive
        });

        return (
            <div className={wrapperClass} onClick={this.onWrapperClick}>
                <Topbar onToggleMenu={this.onToggleMenu} />
                <Sidebar />

                <div className='layout-main'>
                    <Switch>
                        <PrivateRoute path='/app/filial' roles={['ROLE_RH']} component={Filial} />
                        <PrivateRoute path='/app/evento' roles={['ROLE_RH']} component={Evento} />
                        <PrivateRoute path='/app/usuario' roles={['ROLE_ADMIN']} component={Usuario} />
                        <PrivateRoute path='/app/empresa' roles={['ROLE_RH']} component={Empresa} />
                        <PrivateRoute path='/app/periodo' roles={['ROLE_RH']} component={Periodo} />
                        <PrivateRoute path='/app/dashboard' roles={['ROLE_USER']} component={Dashboard} />
                        <PrivateRoute path='/app/departamento' roles={['ROLE_RH']} component={Departamento} />
                        <PrivateRoute path='/app/faturamento' roles={['ROLE_USER']} component={Faturamento} />
                        <PrivateRoute path='/app/tipoDesconto' roles={['ROLE_DEPTO']} component={TipoDesconto} />
                        <PrivateRoute path='/app/relatorioNota' roles={['ROLE_USER']} component={RelatorioNota} />
                        <PrivateRoute path='/app/perfilUsuario' roles={['ROLE_USER']} component={PerfilUsuario} />
                        <PrivateRoute path='/app/posicaoSintetica' roles={['ROLE_ADMIN']} component={PosicaoSintetica} />
                        <PrivateRoute path='/app/debitoFuncionario' roles={['ROLE_RH']} component={DebitoFuncionario} />
                        <PrivateRoute path='/app/funcionario' roles={['ROLE_RH']} component={Funcionario} />
                        <PrivateRoute path='/app/seguroVida' roles={['ROLE_RH']} component={SeguroVida} />
                        <PrivateRoute path='/app/arquivoFolha' roles={['ROLE_RH']} component={ArquivoFolha} />


                        <PrivateRoute path='/app/calendario' roles={['ROLE_RH']} component={Calendario} />
                        <Route path='*' component={PaginaNaoEncontrada} />
                    </Switch>
                </div>

                <Footer />

                <div className='layout-mask'></div>
            </div>
        );
    }
}

export default withRouter(App);