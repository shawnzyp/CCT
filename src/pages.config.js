import Characters from './pages/Characters';
import CreateCharacter from './pages/CreateCharacter';
import CharacterSheet from './pages/CharacterSheet';


export const PAGES = {
    "Characters": Characters,
    "CreateCharacter": CreateCharacter,
    "CharacterSheet": CharacterSheet,
}

export const pagesConfig = {
    mainPage: "Characters",
    Pages: PAGES,
};