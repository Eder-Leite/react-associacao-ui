import { Menu } from '../menu';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import React, { Component } from 'react';
import PerfilSidebar from '../perfilSidebar';
import { ScrollPanel } from 'primereact/components/scrollpanel/ScrollPanel';

class Sidebar extends Component {

    constructor(props) {
        super(props);

        this.state = {
            overlayMenuActive: true,
            mobileMenuActive: true
        };

        this.onSidebarClick = this.onSidebarClick.bind(this);
        this.onMenuItemClick = this.onMenuItemClick.bind(this);
        this.createMenu();
    }

    static defaultProps = {
        menuClick: true
    }

    static propTypes = {
        menuClick: PropTypes.bool
    }

    componentDidMount() {
        this.onMenuClick(true);
    }

    createMenu() {
        this.menu = [
            { label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/app/dashboard' },
            {
                label: 'Cadastro', icon: 'pi pi-fw pi-users',
                items: [
                    { label: 'Empresa', icon: 'pi pi-fw pi-bookmark', to: '/app/empresa' },
                    { label: 'Evento', icon: 'pi pi-fw pi-bookmark', to: '/app/evento' },
                    { label: 'Período', icon: 'pi pi-fw pi-bookmark', to: '/app/periodo' },
                    { label: 'Filial', icon: 'pi pi-fw pi-bookmark', to: '/app/filial' },
                    { label: 'Funcionário', icon: 'pi pi-fw pi-bookmark', to: '/app/funcionario' },
                    { label: 'Seguro Vida', icon: 'pi pi-fw pi-bookmark', to: '/app/seguroVida' },
                    { label: 'Tipo Desconto', icon: 'pi pi-fw pi-bookmark', to: '/app/tipoDesconto' },
                ]
            },
            {
                label: 'Segurança', icon: 'pi pi-fw pi-lock',
                items: [
                    { label: 'Departamento', icon: 'pi pi-fw pi-bookmark', to: '/app/departamento' },
                    { label: 'Usuário', icon: 'pi pi-fw pi-bookmark', to: '/app/usuario' },
                ]
            },
            {
                label: 'Faturamento', icon: 'pi pi-fw pi-dollar',
                items: [
                    { label: 'Arquivo Folha', icon: 'pi pi-fw pi-bookmark', to: '/app/arquivoFolha' },
                    { label: 'Débitos Funcionário', icon: 'pi pi-fw pi-bookmark', to: '/app/debitoFuncionario' },
                    { label: 'Gerar Nota', icon: 'pi pi-fw pi-bookmark', to: '/app/faturamento' },
                    { label: 'Posição Sintética', icon: 'pi pi-fw pi-bookmark', to: '/app/posicaoSintetica' },
                    { label: 'Relatório Nota', icon: 'pi pi-fw pi-bookmark', to: '/app/relatorioNota' },
                ]
            }
        ];
    }

    onSidebarClick() {

        try {
            Sidebar.prototype.menuClick = true;
            if (this.hasOwnProperty(this.layoutMenuScroller) && this.state.mobileMenuActive) {
                setTimeout(() => { this.layoutMenuScroller.moveBar(); }, 500);
            }
        } catch (error) {

        }
    }

    isMenuClick() {
        return Boolean(Sidebar.prototype.menuClick);
    }

    onMenuClick(value) {
        Sidebar.prototype.menuClick = value;
    }

    onMenuItemClick(event) {
        if (!event.item.items) {
            this.setState({
                overlayMenuActive: false,
                mobileMenuActive: false
            })
        }
    }

    render() {
        let sidebarClassName = classNames('layout-sidebar', 'layout-sidebar-dark');

        return (
            <div ref={(el) => this.sidebar = el} className={sidebarClassName} onClick={this.onSidebarClick}>
                <ScrollPanel ref={(el) => this.layoutMenuScroller = el} style={{ height: '100%' }}>
                    <div className='layout-sidebar-scroll-content'>
                        <div className='layout-logo'>
                            <img alt='Logo' src='../assets/images/logoEvolution.png' style={{ width: 120 }} />
                        </div>
                        <PerfilSidebar />
                        <Menu model={this.menu} onMenuItemClick={this.onMenuItemClick} />
                    </div>
                </ScrollPanel>
            </div>
        );
    }
}

export default Sidebar;