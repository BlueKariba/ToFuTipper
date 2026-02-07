export const PROJECT_TITLE = "Tobis Superbowl Tippspiel";

export const TEAMS = {
  patriots: {
    name: "New England Patriots",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/da/NFL_New_England_Patriots.svg"
  },
  seahawks: {
    name: "Seattle Seahawks",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/11/NFL_Seattle_Seahawks.svg"
  }
} as const;

export const GAME = {
  event: "Super Bowl LX (60)",
  teams: `${TEAMS.patriots.name} vs ${TEAMS.seahawks.name}`,
  date: "Sonntag, 8. Februar 2026",
  overUnder: 45.5
};

export const OPTIONS = {
  winner: ["New England Patriots", "Seattle Seahawks"],
  overUnder: ["Over 45.5", "Under 45.5"],
  mvp: [
    "Drake Maye (NE, QB)",
    "Sam Darnold (SEA, QB)",
    "Kenneth Walker III (SEA, RB)",
    "Jaxon Smith-Njigba (SEA, WR)",
    "Cooper Kupp (SEA, WR)",
    "Rashid Shaheed (SEA, WR)",
    "AJ Barner (SEA, TE)",
    "Elijah Arroyo (SEA, TE)",
    "Rhamondre Stevenson (NE, RB)",
    "Kayshon Boutte (NE, WR)"
  ],
  receiving: [
    "Jaxon Smith-Njigba (SEA)",
    "Cooper Kupp (SEA)",
    "Rashid Shaheed (SEA)",
    "Jake Bobo (SEA)",
    "AJ Barner (SEA)",
    "Elijah Arroyo (SEA)",
    "Kayshon Boutte (NE)",
    "Hunter Henry (NE)",
    "Rhamondre Stevenson (NE)",
    "Efton Chism III (NE)"
  ],
  rushing: [
    "Kenneth Walker III (SEA)",
    "George Holani (SEA)",
    "Zach Charbonnet (SEA)",
    "Sam Darnold (SEA)",
    "Drew Lock (SEA)",
    "Drake Maye (NE)",
    "Joshua Dobbs (NE)",
    "Rhamondre Stevenson (NE)",
    "TreVeyon Henderson (NE)",
    "Tommy DeVito (NE)"
  ],
  badBunny: ["Ja", "Nein", "Unklar / nicht passiert"],
  patriotsLove: [
    "Brady-Ära / Dynasty-Vibes",
    "Defense wins championships",
    "Ich mag effizienten, disziplinierten Football",
    "Fan seit Kindheit / Family Tradition",
    "Ich feiere Logo & Uniformen",
    "Team Understatement statt Hype",
    "Ich mag den Underdog-Arc dieser Saison",
    "Ich bin wegen Drake Maye dabei",
    "Ich liebe Run-Game & Toughness",
    "Patriot Pride – Gefühlssache"
  ]
} as const;

export const CATEGORY_LABELS = {
  winner: "Super Bowl Sieger",
  overUnder: "Over/Under",
  mvp: "Super Bowl MVP",
  receiving: "Most Receiving Yards",
  rushing: "Most Rushing Yards",
  badBunny: "Beleidigt Bad Bunny in der Halbzeit",
  patriotsLove: "Warum ich die Patriots liebe"
} as const;

export const SCORING_KEYS = [
  "winner",
  "overUnder",
  "mvp",
  "receiving",
  "rushing",
  "badBunny"
] as const;

export type ScoringKey = (typeof SCORING_KEYS)[number];

export const SUBMISSION_COOKIE = "sb_party_submission_id";
export const ADMIN_COOKIE = "sb_party_admin_session";
export const RESULTS_ID = "global-results";
