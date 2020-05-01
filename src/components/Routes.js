import App from './app';
import React from 'react';
import Login from './login';
import AcessoNegado from './acessoNegado';
import Cadastro from './cadastro/Cadastro';
import RecuperarSenha from './recuperarSenha';
import PaginaNaoEncontrada from './paginaNaoEncontrada';

import { isAuthenticated } from '../services/Auth';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props => (
            isAuthenticated() ? (
                <Component {...props} />
            ) : (
                    <Redirect to={{ pathname: '/', state: { from: props.location } }} />
                )
        )} />
);

const Routes = () => (
    <BrowserRouter basename='/#'>
        <Switch>
            <Route exact path='/' component={Login} />
            <PrivateRoute path='/app' component={App} />
            <Route exact path='/cadastrarSe' component={Cadastro} />
            <Route exact path='/acessoNegado' component={AcessoNegado} />
            <Route exact path='/recuperarSenha' component={RecuperarSenha} />

            <Route path='*' component={PaginaNaoEncontrada} />
        </Switch>
    </BrowserRouter>
);

export default Routes;