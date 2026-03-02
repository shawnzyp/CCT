/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AICharacterAssist from './pages/AICharacterAssist';
import AIGameSession from './pages/AIGameSession';
import AIMissionGen from './pages/AIMissionGen';
import AIMissionPlay from './pages/AIMissionPlay';
import AegisLogs from './pages/AegisLogs';
import CampaignDetail from './pages/CampaignDetail';
import Campaigns from './pages/Campaigns';
import CharacterSheet from './pages/CharacterSheet';
import CombatSimulator from './pages/CombatSimulator';
import CreateCharacter from './pages/CreateCharacter';
import DMHub from './pages/DMHub';
import DMTools from './pages/DMTools';
import DiceRoller from './pages/DiceRoller';
import DiscordSettings from './pages/DiscordSettings';
import Economy from './pages/Economy';
import Help from './pages/Help';
import Home from './pages/Home';
import Missions from './pages/Missions';
import Operations from './pages/Operations';
import OperationsMap from './pages/OperationsMap';
import RewardCenter from './pages/RewardCenter';
import Rules from './pages/Rules';
import Settings from './pages/Settings';
import ThreatIntel from './pages/ThreatIntel';
import Factions from './pages/Factions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AICharacterAssist": AICharacterAssist,
    "AIGameSession": AIGameSession,
    "AIMissionGen": AIMissionGen,
    "AIMissionPlay": AIMissionPlay,
    "AegisLogs": AegisLogs,
    "CampaignDetail": CampaignDetail,
    "Campaigns": Campaigns,
    "CharacterSheet": CharacterSheet,
    "CombatSimulator": CombatSimulator,
    "CreateCharacter": CreateCharacter,
    "DMHub": DMHub,
    "DMTools": DMTools,
    "DiceRoller": DiceRoller,
    "DiscordSettings": DiscordSettings,
    "Economy": Economy,
    "Help": Help,
    "Home": Home,
    "Missions": Missions,
    "Operations": Operations,
    "OperationsMap": OperationsMap,
    "RewardCenter": RewardCenter,
    "Rules": Rules,
    "Settings": Settings,
    "ThreatIntel": ThreatIntel,
    "Factions": Factions,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};