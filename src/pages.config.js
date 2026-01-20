import CampaignDetail from './pages/CampaignDetail';
import Campaigns from './pages/Campaigns';
import CharacterSheet from './pages/CharacterSheet';
import Characters from './pages/Characters';
import CreateCharacter from './pages/CreateCharacter';
import DMTools from './pages/DMTools';
import Help from './pages/Help';
import Home from './pages/Home';
import PlayCampaign from './pages/PlayCampaign';
import Rules from './pages/Rules';
import Settings from './pages/Settings';
import Economy from './pages/Economy';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CampaignDetail": CampaignDetail,
    "Campaigns": Campaigns,
    "CharacterSheet": CharacterSheet,
    "Characters": Characters,
    "CreateCharacter": CreateCharacter,
    "DMTools": DMTools,
    "Help": Help,
    "Home": Home,
    "PlayCampaign": PlayCampaign,
    "Rules": Rules,
    "Settings": Settings,
    "Economy": Economy,
}

export const pagesConfig = {
    mainPage: "Characters",
    Pages: PAGES,
    Layout: __Layout,
};