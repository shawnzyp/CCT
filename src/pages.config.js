import CampaignDetail from './pages/CampaignDetail';
import Campaigns from './pages/Campaigns';
import CharacterSheet from './pages/CharacterSheet';
import Characters from './pages/Characters';
import CreateCharacter from './pages/CreateCharacter';
import DMTools from './pages/DMTools';
import Economy from './pages/Economy';
import Help from './pages/Help';
import Home from './pages/Home';
import PlayCampaign from './pages/PlayCampaign';
import Rules from './pages/Rules';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "CampaignDetail": CampaignDetail,
    "Campaigns": Campaigns,
    "CharacterSheet": CharacterSheet,
    "Characters": Characters,
    "CreateCharacter": CreateCharacter,
    "DMTools": DMTools,
    "Economy": Economy,
    "Help": Help,
    "Home": Home,
    "PlayCampaign": PlayCampaign,
    "Rules": Rules,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Characters",
    Pages: PAGES,
    Layout: __Layout,
};