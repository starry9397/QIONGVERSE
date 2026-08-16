# Asset Ledger

## Runtime Root Coverage

| Runtime root | Content | Current use | Required label | Fallback |
| --- | --- | --- | --- | --- |
| `public/assets/hero/` | Homepage brand visual | `#top` | Project brand visual | Solid brand surface |
| `public/assets/brand/` | Transparent logo assets | Global header | Project brand asset | Accessible text name |
| `public/assets/3d/tropical/` | Tropical SPZ and reference image | Tropical hall | Project-curated spatial media | Static reference image |
| `public/assets/3d/limiao/` | Li & Miao SPZ and reference image | Li & Miao hall | Project-curated spatial media | Static reference image |
| `public/assets/3d/aerospace/` | Aerospace SPZ and reference image | Aerospace hall | Project-curated spatial media | Static reference image |
| `public/assets/3d/huali/` | Rosewood SPZ and reference image | Rosewood hall | Project-curated spatial media | Static reference image |
| `public/assets/3d/countryside/` | Village SPZ and reference image | Village hall | Project-curated spatial media | Static reference image |
| `public/assets/3d/zimaogang/` | Free Trade Port SPZ and reference image | FTP hall | Project-curated spatial media | Static reference image |
| `public/assets/3d/products/` | On-demand GLBs and posters | Exhibit detail | AIGC concept exhibit / needs review | Poster and description |
| `public/assets/3d/luoyin/` | Desktop/mobile avatar GLBs | Opt-in guide | Fictional project guide | Hide avatar, retain free camera |
| `public/assets/luoyin/` | Transparent 2D Luoyin desktop-pet visual | Global fictional guide trigger | Original fictional project guide | Labelled text trigger and chat panel |
| `public/assets/hainan-map/hainan-administrative-map-user-provided.png` | User-provided Hainan administrative-map reference | Homepage regional-reading visual | Supplied project media; not a fact source, survey, or navigation layer | Local reading-map fallback and 19 accessible controls |
| `public/assets/social/` | 9:16 Luoyin CG social-video derivative | TikTok visitor-authorized post only | Supplied project media derivative | OAuth disabled state; no upload |
| `public/shellsong/models/web/` | Seven Draco-compressed, 2048px-texture ShellSong GLB delivery derivatives | ShellSong model chooser, loaded only after selection | Supplied project media delivery derivative; original GLBs retained | Labelled static model fallback |
| `public/assets/travel/hainan-unfolded-hero.mp4` | Hainan travel film | YouTube visitor-authorized upload only | Supplied project visual media | OAuth disabled state; no upload |
| `public/assets/travel/hainan-unfolded-hero-pages.mp4` and `public/shellsong/video/luoyin-cg-pages.mp4` | 1280x720 H.264/AAC delivery derivatives | Travel Atlas and ShellSong public playback | Supplied project media derivative; source originals retained | Poster/static reading state |
| `public/assets/home-thumbs/` | Five 640px WebP derivatives for the homepage wheel and dial | Initial homepage navigation only | Supplied project media delivery derivative; source originals retained | Original hall image, then poster |
| `public/assets/exhibits/` and `public/assets/user-media2/` | Hall and exhibit images | Wheel and details | Supplied project visual archive | Readable caption |

All current runtime roots are `project-provided / evidence collection pending`, except the reviewed external source metadata in `knowledge/source-registry.json`. Local media provides visual context only and cannot establish geographic, historical, technical, policy, product, price, inventory, or availability facts.
