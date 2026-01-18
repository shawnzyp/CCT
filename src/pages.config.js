import Characters from './pages/Characters';
import CreateCharacter from './pages/CreateCharacter';
import CharacterSheet from './pages/CharacterSheet';
import Campaigns from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Characters": Characters,
    "CreateCharacter": CreateCharacter,
    "CharacterSheet": CharacterSheet,
    "Campaigns": Campaigns,
    "CampaignDetail": CampaignDetail,
}

export const pagesConfig = {
    mainPage: "Characters",
    Pages: PAGES,
    Layout: __Layout,
};