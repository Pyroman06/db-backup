import React from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Home from '../components/home';
import Header from '../components/header';
import Footer from '../components/footer';

const App = ({ location }) => {
    return (
        <div className="main-container">
            <Header />
            <Switch location={location}>
                <Route exact path='/' component={Home} />
                <Route path='*' render={(props) => (
                    <Redirect to='/' push />
                )} />
            </Switch>
            <Footer />
        </div>
    );
}

export default App;