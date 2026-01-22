import AegisLogs from './pages/AegisLogs';
import CampaignDetail from './pages/CampaignDetail';
import Campaigns from './pages/Campaigns';
import CharacterSheet from './pages/CharacterSheet';
import CreateCharacter from './pages/CreateCharacter';
import DMHub from './pages/DMHub';
import DMTools from './pages/DMTools';
import DiceRoller from './pages/DiceRoller';
import DiscordSettings from './pages/DiscordSettings';
import Economy from './pages/Economy';
import Help from './pages/Help';
import Home from './pages/Home';
import RewardCenter from './pages/RewardCenter';
import Rules from './pages/Rules';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AegisLogs": AegisLogs,
    "CampaignDetail": CampaignDetail,
    "Campaigns": Campaigns,
    "CharacterSheet": CharacterSheet,
    "CreateCharacter": CreateCharacter,
    "DMHub": DMHub,
    "DMTools": DMTools,
    "DiceRoller": DiceRoller,
    "DiscordSettings": DiscordSettings,
    "Economy": Economy,
    "Help": Help,
    "Home": Home,
    "RewardCenter": RewardCenter,
    "Rules": Rules,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};