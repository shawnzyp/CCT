import CampaignDetail from './pages/CampaignDetail';
import Campaigns from './pages/Campaigns';
import CharacterSheet from './pages/CharacterSheet';
import Characters from './pages/Characters';
import CreateCharacter from './pages/CreateCharacter';
import Home from './pages/Home';
import DMTools from './pages/DMTools';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CampaignDetail": CampaignDetail,
    "Campaigns": Campaigns,
    "CharacterSheet": CharacterSheet,
    "Characters": Characters,
    "CreateCharacter": CreateCharacter,
    "Home": Home,
    "DMTools": DMTools,
}

export const pagesConfig = {
    mainPage: "Characters",
    Pages: PAGES,
    Layout: __Layout,
};