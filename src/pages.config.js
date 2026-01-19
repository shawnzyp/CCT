import CampaignDetail from './pages/CampaignDetail';
import Campaigns from './pages/Campaigns';
import Characters from './pages/Characters';
import CreateCharacter from './pages/CreateCharacter';
import DMTools from './pages/DMTools';
import Help from './pages/Help';
import Home from './pages/Home';
import PlayCampaign from './pages/PlayCampaign';
import Settings from './pages/Settings';
import CharacterSheet from './pages/CharacterSheet';
import Rules from './pages/Rules';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CampaignDetail": CampaignDetail,
    "Campaigns": Campaigns,
    "Characters": Characters,
    "CreateCharacter": CreateCharacter,
    "DMTools": DMTools,
    "Help": Help,
    "Home": Home,
    "PlayCampaign": PlayCampaign,
    "Settings": Settings,
    "CharacterSheet": CharacterSheet,
    "Rules": Rules,
}

export const pagesConfig = {
    mainPage: "Characters",
    Pages: PAGES,
    Layout: __Layout,
};