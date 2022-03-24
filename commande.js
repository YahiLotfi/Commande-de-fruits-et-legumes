'use strict';

window.addEventListener('load',go);

// SAM Design Pattern : http://sam.js.org/
let samActions, samModel, samState, samView;

function go() {
  console.info('Go!');
  
  samActions.exec({do:'init', artiPart1:artiPart1Data, artiPart2:artiPart2Data});
  
  // pour un nombre de lignes pleines d'articles quelque soit la largeur du navigateur
  window.addEventListener('resize', () => {samActions.exec({do:'updatePagination'})});
}

//----------------------------------------------------------------- Actions ---
// Actions appelées dans le code HTML quand des événements surviennent
//

samActions = {
  
  exec(data) {
    let enableAnimation = true; // pour les animations sur l'interface graphique
    let proposal;
    switch (data.do) {
      case 'init': {
        console.log('samActions.init');
        proposal = {do:data.do, artiPart1:data.artiPart1, artiPart2:data.artiPart2};
        enableAnimation = false;
      } break; 
      // Display 
      case 'viewCartToggle'    : proposal = {do:data.do}; break;
      case 'gridListView'      :  proposal = {do:data.do, view: data.view}; break;
      case 'sortCart' :  proposal = {do:data.do, property: data.property}; break;
      case 'searchglobal' : proposal={do : data.do}; break;
      case 'imagesToggle'      : proposal = {do:data.do}; break;
      case 'animationsToggle'  : proposal ={do:data.do}; break; 
      case 'changerquantity' : proposal={do: data.do,hisid: data.hisid, e : data.e}; console.log('ss',data.e); break;
      case 'ajoutarticle' : proposal={do: data.do, hisid: data.hisid, quantity : data.quantity}; break;
  
      case  'changeselect' : proposal={do:data.do, hisid : data.hisid}; break;
      case 'supTagRech' : proposal ={do:data.do}; break;
      case 'with animation'    : proposal = data; break;
      case 'Article' : proposal ={do:data.do, filterName:data.filterName}; break;
      case 'filterToute' : proposal ={do:data.do, touteswho : data.touteswho};
      break;
      case 'search': proposal ={do:data.do, hisid: data.hisid , e : data.event}; 
      break;
      case 'darkThemeToggle'   : proposal ={do:data.do}; break; 
      case  'cartDelete': proposal ={do:data.do}; break;
      case 'updatePagination'  : proposal ={do:data.do}; break;

      // Pagination
      // TODO
      case 'without animation' : enableAnimation = false; proposal = data; break;
     case 'changeLinesPerPage' : proposal={ do : data.do, view : data.view, e : data.e}; break;
      
     case 'changePage' : proposal={ do : data.do, direction : data.direction , view : data.view }
    break;
    case 'next': proposal = { do : data.do, view : data.view}; break;
    case 'before' : proposal = { do : data.do, view : data.view}; break;
   
      
      default : 
        console.error('samActions - Action non prise en compte : ', data);
        return;
    }
    if (enableAnimation && samModel.model.settings.animations)
      setTimeout(()=>samModel.samPresent(proposal), 200);
    else             samModel.samPresent(proposal);
  },

};
//-------------------------------------------------------------------- Model ---
// Unique source de vérité de l'application
//

const initialModel= {
  authors  : ['YAHI Lotfi'],
  artiPart1: [],
  artiPart2: [],
  articles : {
    values : [],
    hasChanged : true,
  },
  categories: [],
  origins   : [],
  
  filters: {
    categories:{
      booleans: {}, // filtre actif ou non pour chaque catégorie
      count   : {}, // nombre d'articles de chaque catégorie
      toutesCats :{toutebool : true, val :0} ,
    },
    origins:{
      booleans: {},
      count   : {},
      toutesOrg :{toutebool : true, val :0} ,
    },
    search : {
      global: false, // recherche sur tous les articles ou seulement les articles filtrés
      text: 'a',   // texte recherché
    },
  },
  settings : {
    articleImages: true,
    animations   : true,
    darkTheme    : false,
  },
  display : {
    cartView     : true,   // panier visible ou non
    articlesView : 'grid', // affichage en 'grid' ou 'list'
  },
  pagination: {
    grid: {
      currentPage : 1,
      linesPerPage: 3,
      linesPerPageOptions: [1,2,3],
    },
    
    list: {
      currentPage : 1,
      linesPerPage: 6,
      linesPerPageOptions : [3,6,9],
    },
  },
  
  cartSort : {
    property  : 'name',   // tri du panier selon cette propriété
    ascending : {         // ordre du tri pour chaque propriété
      name    : true,
      quantity: true,
      total   : true,
    },  
    hasChanged: true,
  },  
};

samModel = {

  model: initialModel,

  // Demande au modèle de se mettre à jour en fonction des données qu'on
  // lui présente.
  // l'argument data est un objet confectionné dans les actions.
  // Les propriétés de data désignent la modification à faire sur le modèle.
  samPresent(data) {
    
    switch (data.do) {
      case 'init': {
        console.log('samModel.init');
       this.model.artiPart1 = data.artiPart1;
         this.model.artiPart2 = data.artiPart2;
        this.modelAssign('artiPart1', data.artiPart1);
        this.modelAssign('artiPart2', data.artiPart2);
        this.createArticles();
        this.extractCategories();
        this.extractOrigins();
      } break;
      
      case 'viewCartToggle'    : this.modelToggle('display.cartView');       break;
      case 'imagesToggle'      : this.modelToggle('settings.articleImages'); break;
      case 'animationsToggle'  : this.modelToggle('settings.animations'   ); break;
      case 'darkThemeToggle'   : this.modelToggle('settings.darkTheme'    ); break;      
      case 'gridListView'      : this.modelAssign('display.articlesView', data.view); break;      
      
      case 'updatePagination'  : ; break;
      //TODO 
      case 'changeLinesPerPage' :
        this.model.pagination[data.view].linesPerPage=data.e.target.value;
      break;
      case 'next':
        if(this.model.pagination[data.view].currentPage!=samState.state.pagination[data.view].numberOfPages){
          
          this.model.pagination[data.view].currentPage+=1;}
      break;
        case 'before':
          if(this.model.pagination[data.view].currentPage!=1){
           
          this.model.pagination[data.view].currentPage-=1;}
        break;
      case 'changePage' :
        let dataview = data.view
        this.model.pagination[dataview].currentPage<data.direction? this.model.pagination[dataview].currentPage+= data.direction-this.model.pagination[dataview].currentPage:  this.model.pagination[dataview].currentPage-= this.model.pagination[dataview].currentPage-data.direction  ;
      break;
        //do:'changePage', direction:${i+1}', view:${gridOn?'grid' : 'list'
      case 'sortCart' :
        samState.state.cartSort.property=data.property;
        samState.state.cart.hasChanged=true;
        samState.state.cartSort.hasChanged=true;
      ;
      break;
      case 'searchglobal' : 
      this.model.filters.search.global=!this.model.filters.search.global; 
      break;
      case  'changeselect' :
        let artvalue0=this.model.articles.values;
        for(let i=0; i<artvalue0.length ; i++){
         if(artvalue0[i].id==data.hisid){
          artvalue0[i].selecttodelete=!artvalue0[i].selecttodelete;

            }
        }
        this.model.articles.hasChanged=true;
      //  samState.state.filteredArticles.hasChanged = true;
break;
      case  'cartDelete' :
        let artvalue3=this.model.articles.values;
        artvalue3.map((v)=>{
          if(v.selecttodelete==true){
            v.inCart=false;
              }
        })
     
      this.model.articles.hasChanged=true;
      //  samState.state.filteredArticles.hasChanged = true;
break;
      case 'changerquantity' : 
      let artvalue=this.model.articles.values;
      for(let i=0; i<artvalue.length; i++){
        if(artvalue[i].id==data.hisid){
          artvalue[i].quantity=data.e.target.value;
          if(artvalue[i].quantity==0){
            artvalue[i].inCart=false;
          }
        }
      }
      this.model.articles.hasChanged = true;
      break;
      case 'ajoutarticle' :
        let artvalue2=this.model.articles.values;
        for(let i=0; i<artvalue2.length; i++){
      if(data.hisid==artvalue2[i].id){
        if(artvalue2[i].quantity>0)
        artvalue2[i].inCart=true;
      }
        }
        this.model.articles.hasChanged = true;
      break;
      case 'supTagRech' : 
      this.model.filters.search.text='';
      break;
      case 'search': this.model.filters.search.text=data.e.target.value ;   
      break;
      case  'Article' :
        let tabCat =this.model.categories;
      
        if(tabCat.includes(data.filterName)){
        this.model.filters.categories.booleans[ data.filterName ]= !this.model.filters.categories.booleans[ data.filterName ];
         } 
         if(this.model.origins.includes(data.filterName)){
          this.model.filters.origins.booleans[ data.filterName ]= !this.model.filters.origins.booleans[ data.filterName ];
          
         
         }
         this.model.articles.hasChanged=true;
         samState.state.filteredArticles.hasChanged = true;

         
         
        
        
      break;

      case 'filterToute':
        let j=0;
        let filterToute;
        let tab;
        let filterbool;
        if (data.touteswho=='categories'){
          filterToute=this.model.filters.categories.toutesCats;
          tab=this.model.categories;
          filterbool=this.model.filters.categories
        }else{

          filterToute=this.model.filters.origins.toutesOrg;
          tab=this.model.origins;
          filterbool=this.model.filters.origins;
        }
        //let tabOrg=model.origins;
 
        for(let i=0; i<tab.length;i++){
    if(filterbool.booleans[tab[i]]==true){
      j++;
    }
      }
      if(j==tab.length){
        filterToute.toutebool=true;
      }else  {
        filterToute.toutebool=false;
      }

         //filterName:'${model.filters.categories}
         filterToute.toutebool=!filterToute.toutebool;
         if(filterToute.toutebool==false){
           for(let i=0; i<tab.length; i++){
            filterbool.booleans[tab[i]]=false;
          }
         }else {

          for(let i=0; i<tab.length; i++){
            filterbool.booleans[tab[i]]=true;
         }
        }
        this.model.articles.hasChanged=true;
        
        
      break;
      default : 
        console.error('samPresent() - proposition non prise en compte : ', data);
        return;
    }

    // Demande à l'état de l'application de prendre en compte la modification
    // du modèle
    samState.samUpdate(this.model);
    
    this.model.articles.hasChanged = false;
    this.model.cartSort.hasChanged = false;
  },

  
  /**
   * Cadeau : Affecte value à la propriété propertyStr
   * 
   * modelToggle('display.cartView'); 
   * est équivalent à :
   * this.model.display.cartView = !this.model.display.cartView;
   * 
   * Intérêt : plus compact et un message d'erreur est envoyé si le nom de la proprité est incorrecte
   * ou si les types sont différents.
   *
   * @param {string} propertyStr 
   * @param {any}    value 
   */
   modelToggle(propertyStr) {
    const root = 'model';
    const path = propertyStr.split('.');
    let val = this[root];
    let pathNames = ['this',root];
    path.some((v, i, a) => {
      pathNames.push(v);
      if (val[v]===undefined) {
        console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is undefined`);
        return true;
      }
      if (i < a.length - 1) { 
        val = val[v]; 
      } else {
        if (typeof val[v] != undefined && typeof val[v] != 'boolean') {
          console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is not a boolean`);
          return true;
        };
        val[v] = !val[v];
      }
    });
  },
  /**
   * Cadeau : Transforme une propriété booléenne en son opposée (true -> false, false -> true)
   * 
   * this.modelAssign('artiPart1', data.artiPart1);
   * est équivalent à :
   * this.model.artiPart1 = data.artiPart1;
   *
   * Intérêt : un message d'erreur est envoyé si le nom de la proprité est incorrecte
   * ou si elle n'est pas de type booléen.
   *
   * @param {string} propertyStr 
   */
   modelAssign(propertyStr, value) {
    const root = 'model';
    const path = propertyStr.split('.');
    let val = this[root];
    let pathNames = ['this',root];
    path.some((v, i, a) => {
      pathNames.push(v);
      if (val[v]===undefined) {
        console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} is undefined`);
        return true;
      }
      if (i < a.length - 1) { 
        val = val[v]; 
      } else {
        if (typeof val[v] != undefined && typeof val[v] !== typeof value) {
          console.error(`modelToggle(${propertyStr}) : ${pathNames.join('.')} (${typeof val[v]}) is not of the same type of ${value} (${typeof value})`);
          return true;
        };
        val[v] = value;
      }
    });
  },



  
  /**
   * fonction à passer en paramete à Array.sort() pour trier un tableau d'objets
   * selon leur nom, et leur prix s'il ont le même nom.
   *
   * @param {Object} a 
   * @param {Object} b 
   * @returns -1 or 0 or 1
   */
  articlesSort(a,b) {
    if (a.name.toLowerCase() <b.name.toLowerCase() ) return -1;
    if (a.name.toLowerCase() >b.name.toLowerCase() ) return  1;
    if (a.price<b.price) return -1;
    if (a.price>b.price) return  1;
    return 0;  
    
  },
  
  /**
   * Création des articles à partir des deux fichiers de données (ArtiPart1 et ArtiPart2).
   *
   * Ce sont ces articles que l'interface graphique va représenter. 
   */
  createArticles() {
    const artiPart1 = this.model.artiPart1;
    const artiPart2 = this.model.artiPart2;
    
    let articleId = 0;
    
    const articles = artiPart1.map((a1)=>{
      
      const articlesTmp = artiPart2.filter((a) => a.id == a1.id).map((a2)=>{
        
        const article = {
          id      : articleId,  // création d'un identifiant unique pour chaque article
          // from artiPart2
          name    : a2.name,
          category: a2.category,
          pictures: a2.pictures,
          // from artiPart1
          origin  : a1.origin,
          price   : a1.price,
          unit    : a1.unit,
          quantity: a1.quantity,
          inCart  : a1.inCart,
          // booléen pour voir si un article est selectioné pour etre supprimé du panier
          selecttodelete : false,
        };
        articleId++;
        
        return article; 
      });
      return articlesTmp[0];
    });
    this.model.articles.values = articles.sort(this.articlesSort);  // articles triés
    this.model.articles.hasChanged = true;
  },
  
  /**
   * Pour un tri par ordre alphabétique
   * 
   */
  alphaSort(a,b) {
    if (a.toLowerCase() <b.toLowerCase() ) return -1;
    if (a.toLowerCase() >b.toLowerCase() ) return  1;
    return 0;  
  },
  
  /**
   * Extraction :
   * - des catégories présentes dans la liste d'articles    --> model.categories
   * - du nombre d'articles appartenant à chaque catégories --> model.filters.categories.count
   *      model.filters.categories.count['fruits'] === 5
   * - du tableau de booléens pour l'état du filtre sur les catégories --> model.filters.categories.booleans
   *      model.filters.categories.booleans['fruits'] === true
   *
   * Les catégories sont triées par ordre alphabétique
   */
 
  extractCategories() {

  
    const articles   = this.model.articles.values;
    const categories = [];
    const catsCount  = {};
    const catsFilter = {};
    let toutesCats=0;
    console.log(catsFilter);
   console.log(articles);
   console.log(catsCount);
   console.log(categories);
    // TODO
    for(let i=0; i<articles.length; i++){
 if(!categories.includes(articles[i].category)){
  categories.push(articles[i].category);
  catsCount[articles[i].category]=0;
  catsFilter[articles[i].category]=true;
 }}
 articles.forEach((v)=>{
  catsCount[v.category] +=1
  })

  for (let i=0; i<categories.length; i++) {
    toutesCats+=catsCount[categories[i]];
  }
  
  
  console.log(catsCount);
  console.log(categories);
  console.log(catsFilter);
    
    
    categories.sort(this.alphaSort);
    this.model.categories = categories;
    this.model.filters.categories.count  = catsCount;
    this.model.filters.categories.booleans = catsFilter;
    this.model.filters.categories.toutesCats.val  = toutesCats;

  },
  
  extractOrigins() {
    // TODO  
    const articles   = this.model.articles.values;
    const origins = [];
    const OriginsCount  = {};
    const OrgFilter = {};
    let toutesOrg=0;
    let j=0;
    for(let i=0; i<articles.length; i++){
      if(!origins.includes(articles[i].origin)){
        origins.push(articles[i].origin);
        OriginsCount[articles[i].origin]=0;
        OrgFilter[articles[i].origin]=true;
      }
      
    }
    for(let i=0; i<articles.length; i++){
      OriginsCount[articles[i].origin]+=1;
    }
    
    
    console.log(OrgFilter);
    for (let i=0; i<origins.length; i++) {
      toutesOrg+=OriginsCount[origins[i]];
      
    }
    
    origins.sort(this.alphaSort);
    this.model.origins = origins;
    this.model.filters.origins.count  = OriginsCount;
    this.model.filters.origins.booleans = OrgFilter;
    this.model.filters.origins.toutesOrg.val  = toutesOrg;
  },


};

//-------------------------------------------------------------------- State ---
// État de l'application avant affichage
//

const initialState = {

  filteredArticles : {    // articles filtrés
    values        : [],
    hasChanged    : true,
    representation: '',   // représentation pour ne pas avoir à la recalculer si n'a pas changé
  },
  
  filters : {
    categories : {
        booleans      : {},  // avec une propriété 'toutes' en plus qui vaut true si toutes les autres sont 'true'
        hasChanged    : true,
        representation: '',
        toutesCats :{toutebool : true, val :0} ,

    },
    origins : {
        booleans      : {},  // avec une propriété 'toutes' aussi
        hasChanged    : true,
        representation: '',
        toutesOrg :{toutebool : true, val :0} ,
    },
    search : {
      global        : false,
      text          : ' ',
      hasChanged    : true,
      representation: '',
    },
  },
  display : {
    cartView: {
      value     : true,
      hasChanged: true,
      },
    articlesView : {
      value     : '',
      hasChanged: true,
      },
  },
  pagination: {  // Toutes ces valeurs sont calculées dans updatePagination()
    grid: {
      currentPage        : undefined,
      linesPerPage       : undefined,
      linesPerPageOptions: undefined,
      
      maxArticlesPerLine: undefined,
      numberOfPages     : undefined,
      hasPrevPage       : undefined,
      hasNextPage       : undefined,
    },
    list: {
      currentPage        : undefined,
      linesPerPage       : undefined,
      linesPerPageOptions: undefined,
      
      maxArticlesPerLine: undefined,
      numberOfPages     : undefined,
      hasPrevPage       : undefined,
      hasNextPage       : undefined,
    },
  },

  cart : {
    values: [],    // le panier rassemble tous les articles dont inCart==true
    total : 0,     // valeur totale du panier
    hasChanged: true,
    representation: '',
  },
  cartSort : {     // pour le tri des articles du panier
    property  : 'name',
    ascending : {
      name    : true,
      quantity: true,
      total   : true,
    },  
    hasChanged: true,
  },

};

samState = {

  state: initialState,

  samUpdate(model) {
    this.updateFilter    (model.filters.categories, this.state.filters.categories);
    this.updateFilter    (model.filters.origins,    this.state.filters.origins);
    this.updateSearch    (model.filters.search);
    this.filterArticles  (model.articles, this.state.filters);
    this.updateDisplay   (model.display);
    this.updatePagination(model.pagination);
    this.updateCartSort  (model.cartSort);
    this.updateCart      (model);

    this.samRepresent(model);
    
    // Nothing more to change
    this.state.filteredArticles.hasChanged     = false;
    this.state.filters.categories.hasChanged   = false;
    this.state.filters.origins.hasChanged      = false;
    this.state.filters.search.hasChanged       = false;
    this.state.display.cartView.hasChanged     = false;
    this.state.display.articlesView.hasChanged = false;
    this.state.cartSort.hasChanged             = false;
    this.state.cart.hasChanged                 = false;
  },
  
  /**
   * recopie les filtres du model dans le state
   * ajoute la propriété 'toutes' au tableau booleans
   */
  updateFilter(modelFilter, stateFilter) {
    
    /*this.state.filters.categories=modelFilter.categories ;
    this.state.filters.origins=modelFilter.origins ;*/
    stateFilter.booleans = modelFilter.booleans;
    stateFilter.toutesCats=modelFilter.toutesCats;
    stateFilter.toutesOrg=modelFilter.toutesOrg
    stateFilter.hasChanged=true;
    console.log('updateFilter', modelFilter)
    
    // TODO
    
    
  },
  
  updateSearch(modelSearch) {
    const stateSearch = this.state.filters.search;
    const globalHasChanged = modelSearch.global != stateSearch.global;
    const textHasChanged   = modelSearch.text   != stateSearch.text;
    stateSearch.hasChanged = globalHasChanged || textHasChanged;
    stateSearch.global     = modelSearch.global;
    stateSearch.text       = modelSearch.text;
  },

  filterArticles(articles, filters) {
    // filters.categories.booleans['légumes']=false;
    // filters.origins.booleans['France']=true;
    if (articles.hasChanged         || 
        filters.categories.hasChanged || 
        filters.origins.hasChanged    ||
        filters.search.hasChanged     ) {
              
      let filteredValues =articles.values; 
    
      
      console.log(filteredValues);
      console.log(filters);
      
      // TODO

      this.state.filteredArticles.values     = filteredValues;
      this.state.filteredArticles.hasChanged = true;

    }
  },

  updateDisplay(display) {
    const cartView = this.state.display.cartView;
    if (cartView.value != display.cartView) {
      cartView.value = display.cartView;
      cartView.hasChanged = true;
    }
    const articlesView = this.state.display.articlesView;
    if (articlesView.value != display.articlesView) {
      articlesView.value = display.articlesView;
      articlesView.hasChanged = true;
    }
    
  },

  updatePagination(pagination) {
    const statePagination = this.state.pagination;
    
    const articleGrid        = document.getElementById('articleWidth');
    const articleWidth       = articleGrid.clientWidth;
    const minCardWidth       = 200;
    const articlesView       = this.state.display.articlesView.value;
    const maxArticlesPerLine = (articlesView == 'grid') ? Math.floor(articleWidth/minCardWidth) : 1;
    const linesPerPage       = pagination[articlesView].linesPerPage;
    const numberOfArticles   = this.state.filteredArticles.values.length;
    const numberOfPages      = Math.ceil(numberOfArticles / (maxArticlesPerLine * linesPerPage));
    
    statePagination[articlesView].currentPage         = pagination[articlesView].currentPage;
    statePagination[articlesView].linesPerPage        = linesPerPage;
    statePagination[articlesView].linesPerPageOptions = pagination[articlesView].linesPerPageOptions;
    statePagination[articlesView].maxArticlesPerLine  = maxArticlesPerLine;
    statePagination[articlesView].numberOfPages       = numberOfPages;
    statePagination[articlesView].hasPrevPage         = pagination[articlesView].currentPage > 1;
    statePagination[articlesView].hasNextPage         = pagination[articlesView].currentPage < numberOfPages;
  
    this.state.display.articlesView.hasChanged = true;
  },

  updateCartSort(cartSort) {
    if (cartSort.hasChanged) {
      this.state.cartSort.property   = cartSort.property;
      this.state.cartSort.ascending  = cartSort.ascending;
      this.state.cartSort.hasChanged = true;
    }
  },

 
  updateCart(model) {
    const articles = model.articles;
    if (articles.hasChanged) {
      this.state.cart.values = [];
      this.state.cart.total = 0; 
 
    this.state.cart.values = articles.values.filter(a => a.inCart);
    
       for(let i=0; i<this.state.cart.values.length; i++){
        this.state.cart.total+=this.state.cart.values[i].price*this.state.cart.values[i].quantity;
       }
      this.state.cart.hasChanged = true;
    }
  },  

  // Met à jour l'état de l'application, construit le code HTML correspondant,
  // et demande son affichage.
  samRepresent(model) {
    
    this.updateFilterUI(model, this.state, 'categories');
    this.updateFilterUI(model, this.state, 'origins');
    this.updateSearchUI(model, this.state);
    this.updateArticlesUI(model, this.state);
    this.updateCartUI(model, this.state);
    
    //Settings
    
    const representation = samView.mainUI(model, this.state);
    
    //Appel l'affichage du HTML généré.
    samView.samDisplay(representation);
  },

  updateFilterUI(model, state, filterName) {
    const filter = state.filters[filterName];
    if (filter.hasChanged) {
      filter.representation = samView.filterUI(model, state, filterName)
      filter.hasChanged = false;
    }
  },

  updateSearchUI(model, state) {
    const filter = state.filters.search;
    if (filter.hasChanged) {
      filter.representation = samView.searchUI(model, state);
      filter.hasChanged = false;
    }
  },

  updateArticlesUI(model, state) {
    const filteredArticles = state.filteredArticles;
    const articlesView     = state.display.articlesView;
    if (filteredArticles.hasChanged || articlesView.hasChanged) {
      filteredArticles.representation = articlesView.value == 'grid' ? samView.articlesGridUI(model, state) : samView.articlesListUI(model, state);
      filteredArticles.hasChanged = false;
      articlesView.hasChanged     = false;
    }
  },
  
  updateCartUI(model, state) {
    const cart     = state.cart;
    const cartView = state.display.cartView;
    const cartSort = state.cartSort;
    if (cart.hasChanged || cartView.hasChanged || cartSort.hasChanged) {
      cart.representation = samView.cartUI(model, state);      
      cart.hasChanged     = false;
      cartView.hasChanged = false;
      cartSort.hasChanged = false;
    }
  },

  updateThemeUI(model, state) {
    const settings = state.settings;
    if (settings.darkThemeHasChanged) {
      samView.darkThemeUI(state);
      settings.darkThemeHasChanged = false;
    }
  },

};
//--------------------------------------------------------------------- View ---
// Génération de portions en HTML et affichage
//
samView = {

  // Injecte le HTML dans une balise de la page Web.
  samDisplay: function (representation) {
    const app = document.getElementById('app');
    app.innerHTML = representation;
  },

  // Astuce : Pour avoir la coloration syntaxique du HTML avec l'extension lit-html dans VSCode
  // https://marketplace.visualstudio.com/items?itemName=bierner.lit-html
  // utiliser this.html`<h1>Hello World</h1>` en remplacement de `<h1>Hello World</h1>`
  html([str, ...strs], ...vals) {
    return strs.reduce((acc,v,i)=> acc+vals[i]+v, str);
  },
 
  mainUI(model,state) {
    
    this.darkThemeUI(model);
    
    const cartClass = model.display.cartView ? 'border' : '';
    
    return this.html`
    <div class="row small-margin">
    <!-- ___________________________________________________________ Entête -->
    <div class="row middle-align no-margin">
      <div class="col s8 m9 l10">
        <h4 class="center-align"> Commande de fruits et légumes</h4>
      </div>
      <div class="col s4 m3 l2">
        <nav class="right-align small-margin">
          <button onclick="samActions.exec({do:'viewCartToggle'})" class="no-marin ${cartClass}">
            <i class="large">shopping_basket</i>
          </button>
          <button class="no-margin" data-ui="#dropdown3_">
            <i class="large">account_circle</i>
            <div id="dropdown3_" data-ui="#dropdown3_" class="dropdown left no-wrap">
              <a>Auteurs : <b>${model.authors}</b></a>
            </div>
          </button>
        </nav>
      </div>
    </div>
    <div class="row">
      <div class="col s3 m2 l2" style="position:sticky; top: 10px;">
        <!-- ______________________________________________________ Filtres -->
      
        <aside>
          <h5>Filtres</h5>
          <h6>Catégories</h6>          
          <div>
            ${state.filters.categories.representation}
          </div>
          <div class="small-space"></div>
          <h6>Origines</h6>
          <div>
            ${state.filters.origins.representation}
          </div>
          <div class="small-space"></div>
          <h6>Recherche</h6>
          ${state.filters.search.representation}
          <div class="small-space"></div>          
          <h5>Paramètres</h5>
          ${this.settingsUI(model,state)}
          
        </aside>

      </div>
      <div class=" col s9 m10 l10">
        <!-- ___________________________________ Récap filtres et recherche -->
        
        
        <div class="row top-align no-margin">
          <nav class="col s8 wrap no-margin">
            ${this.filtersSearchTagsUI(model,state)}
            <!-- ${state.filteredArticles.representation}   -->
          </nav>
          <nav class="col s4 right-align no-margin">
            ${this.articlesViewUI(model,state)}
          </nav>
        </div>
        
        <!-- _____________________________________________________ Articles -->
        
        ${state.filteredArticles.representation}  
      
        <!-- ___________________________________________________ Pagination -->
        ${this.paginationUI(model,state)}
        
        
      </div>
    </div>
  </div>
  <!-- ______________________________________________________________Panier -->
  ${state.cart.representation}
  `;
  },
  
  darkThemeUI(model) {
    const bodyclass = document.body.classList;
    if (model.settings.darkTheme) bodyclass.add   ('is-dark');
    else                          bodyclass.remove('is-dark');
  },
  
  filterUI(model, state, filterName) {
    
    console.log('filterUI', filterName)
    
    // TODO
   
    
    let var2;
    let checked;
    
    
    let j=0;
        let filterToute;
        let tab;
        let filterbool;
        if (filterName =='categories'){
        filterToute=model.filters.categories.toutesCats;
        tab=model.categories;
        filterbool=model.filters.categories
      }else {
        filterToute=model.filters.origins.toutesOrg;
        tab=model.origins;
        filterbool=model.filters.origins
        
      }
        for(let i=0; i<tab.length;i++){
    if(filterbool.booleans[tab[i]]==true){
      j++;
    }
      }
      if(j==tab.length){
        filterToute.toutebool=true;
      }else  {
        filterToute.toutebool=false;
      }
   
    if (filterName =='categories'){
      checked=state.filters.categories.toutesCats.toutebool==true?'checked=\"checked\"': '';
     var2 =`<div><label class="checkbox">
      <input type="checkbox" ${checked} onclick="samActions.exec({do:'filterToute', touteswho : 'categories'})" />
      <span class="capitalize" >toutes</span>  
      <a><span class="badge circle right color-2-text color-2a">${model.filters.categories.toutesCats.val}</span></a>
    </label>
  </div>
 ${ model.categories.map( (v) =>
  {
    checked=state.filters.categories.booleans[v]==true?'checked=\"checked\"': '';
    return `
     <div>
    <label class="checkbox">
      <input  type="checkbox" ${checked}  onclick="samActions.exec({do:'Article', filterName:'${v}'})"  />
      <span class="capitalize">${v}</span>  
      <a><span class="badge circle right color-2-text color-2a" >${model.filters.categories.count[v]}</span></a>
    </label>
  </div> `
    
  } ).join(' ')}`


}else{
  checked=state.filters.origins.toutesOrg.toutebool==true?'checked=\"checked\"': '';
  var2 =`<div><label class="checkbox">
  <input type="checkbox" ${checked} onclick="samActions.exec({do:'filterToute', touteswho : 'origins'})" />
  <span class="capitalize" >toutes</span>  
  <a><span class="badge circle right color-2-text color-2a">${model.filters.origins.toutesOrg.val}</span></a>
</label>
</div>
${ model.origins.map( (v) =>
{
checked=state.filters.origins.booleans[v]==true?'checked=\"checked\"': '';

return `
 <div>
<label class="checkbox">
  <input  type="checkbox" ${checked}  onclick="samActions.exec({do:'Article', filterName:'${v}'})"  />
  <span class="capitalize">${v}</span>  
  <a><span class="badge circle right color-2-text color-2a" >${model.filters.origins.count[v]}</span></a>
</label>
</div> `

} ).join(' ')}`

} 
return this.html `${var2}`

  },
  
  searchUI(model, state) {
    
    console.log('searchUI')
    
    

    
    return this.html`
    <div class="middle-align small-margin">
    <label class="switch">
      <input type="checkbox" ${model.filters.search.global==true? 'checked="checked"' : ''} onchange="samActions.exec({do:'searchglobal'})"  />
      <span>globale</span>
    </label>
  </div>
  <div class="field prefix round fill border small">
    <i>search</i>
    <input type="text" class="align-middle" value="${model.filters.search.text}" onchange="samActions.exec({do:'search', event : event})" /> 
  </div>    
    `;
    
  },
  
  settingsUI(model,state) {
    const withImageChecked  = model.settings.articleImages ? 'checked="checked"' : '';
    const darkThemeChecked  = model.settings.darkTheme     ? 'checked="checked"' : '';
    const animationsChecked = model.settings.animations    ? 'checked="checked"' : '';
    
    return this.html`
      <div class="middle-align small-margin">
        <label class="switch">
          <input type="checkbox" onclick="samActions.exec({do:'imagesToggle'})" ${withImageChecked} />
          <span>Articles <br />avec images</span>
        </label>
      </div>
      <div class="middle-align small-margin">
        <label class="switch">
          <input type="checkbox" onclick="samActions.exec({do:'animationsToggle'})" ${animationsChecked} />
          <span>Animations</span>
        </label>
      </div>          
      <div class="middle-align small-margin">
        <label class="switch">
          <input type="checkbox" onclick="samActions.exec({do:'darkThemeToggle'})" ${darkThemeChecked} />
          <span>Thème <br /> sombre</span>
        </label>
      </div>          
          `;
  },
  
  filtersSearchTagsUI(model, state) {
  
    console.log('filtersSearchTagsUI')
  
    
    let tabCat =model.categories;
    let tabOrg =model.origins;
    let catBool= state.filters.categories.booleans;
    let orgBool =state.filters.origins.booleans;
    let artvalue=model.articles.values;
    let  capitalize=model.filters.search.text.length == 1? '' : 'capitalize'
    let j=0;
  if(model.filters.search.global==false){
    if(model.filters.search.text==''){
    for(let i=0; i<artvalue.length; i++){
      if(catBool[artvalue[i].category]==true && orgBool[artvalue[i].origin]==true){
         j++;
      }}}else if(model.filters.search.text!='') {
        for(let i=0; i<artvalue.length; i++){
          if(catBool[artvalue[i].category]==true && orgBool[artvalue[i].origin]==true){
            if(artvalue[i].name.toLowerCase().includes(state.filters.search.text.toLowerCase())==true){
                 j++
            }

          }

        }
      }}else if(model.filters.search.text==''){
        for(let i=0; i<artvalue.length; i++){
          if(catBool[artvalue[i].category]==true && orgBool[artvalue[i].origin]==true){
             j++;
          }}} else {
            for(let i=0; i<artvalue.length; i++){
              
                if(artvalue[i].name.toLowerCase().includes(state.filters.search.text.toLowerCase())==true){
                     j++
                }
    
              
    
            }

          }
    let var1 = this.html`<label  class="medium-text color-2-text">${j} articles -</label>` ;

    for(let i=0;i<tabCat.length; i++){
if(catBool[tabCat[i]]==true){
var1 +=` <span class="chip small no-margin ${model.filters.search.global==true && model.filters.search.text !=''?'color-2b-text' : ''} capitalize " onclick="samActions.exec({do:'Article', filterName:'${tabCat[i]}'})">
 ${tabCat[i]}<i class="small">close</i>
</span> `

}

    }
    for(let i=0;i<tabOrg.length; i++){
      if(orgBool[tabOrg[i]]==true){
      var1 +=` <span class="chip small no-margin ${model.filters.search.global==true && model.filters.search.text !=''?  'color-2b-text' : ''}    capitalize " onclick="samActions.exec({do:'Article', filterName:'${tabOrg[i]}'})">
       ${tabOrg[i]}<i class="small">close</i>
      </span> `
      
      }
      
          }
          if(model.filters.search.text!= ''){
            
          var1+=` <span class="chip small no-margin ${capitalize} "  onclick="samActions.exec({do:'supTagRech'})" >
         Rech : "${model.filters.search.text}"<i class="small">close</i>
         </span> `
        
        }
         
    return var1;
  },
  
  articlesViewUI(model, state) {
    
    const gridOn = state.display.articlesView.value == 'grid';
    const gridViewClass    = gridOn ? 'disabled' : '';
    const gridViewDisabled = gridOn ? 'disabled="disabled"' : '';
    const listViewClass    = gridOn ? '' : 'disabled';
    const listViewDisabled = gridOn ? '' : 'disabled="disabled"';
  
    return this.html`
      <button onclick="samActions.exec({do:'gridListView', view:'list'})" class="small no-margin ${listViewClass}" ${listViewDisabled}>
        <i>view_list</i></button>
      <button onclick="samActions.exec({do:'gridListView', view:'grid'})" class="small           ${gridViewClass}" ${gridViewDisabled}>
        <i>grid_view</i></button>
    `;
  },
  
  inEuro(number) {
    const numString = (number + 0.0001) + '';
    const dotIndex  = numString.indexOf('.');
    return numString.substring(0, dotIndex+3)+' €';
  },
  
  articlesGridUI(model, state) {
    
    console.log('articlesGridUI');
    
    
    let filtercat=state.filters.categories.booleans;
    let filterorg=state.filters.origins.booleans;
    let tabcat=model.categories;
    let taborg=model.origins;
    let artvalue=model.articles.values
    let articlefiltres=[]; 

    let j=0, k=0;
   
    for(let i=0; i<artvalue.length;i++ ){
      if(model.filters.search.global==false){
      if(filtercat[artvalue[i].category]==true && filterorg[artvalue[i].origin]==true){
        j++;
        if(model.filters.search.text!='' ){
          
          if(artvalue[i].name.toLowerCase().includes(state.filters.search.text.toLowerCase())==true){
            k++;
            articlefiltres.push(artvalue[i]);
          }
        } else {
          articlefiltres.push(artvalue[i]);
        }
      }

    } else if(model.filters.search.text!='' ){
      if(artvalue[i].name.toLowerCase().includes(state.filters.search.text.toLowerCase())==true){
        k++;
        articlefiltres.push(artvalue[i]);
      }
      }else if(filtercat[artvalue[i].category]==true && filterorg[artvalue[i].origin]==true){
        j++;
        articlefiltres.push(artvalue[i]);
      }
  }

  console.log(articlefiltres)
  

  let var1=this.html`<article class="small-margin grid-view">`
  
    
  for(let i=0; i< articlefiltres.length; i++){
    
    var1+=`
<div  class="card no-padding small-margin">  
${model.settings.articleImages ? `         
          <div class="card-image center-align">
            <img src="./images/${articlefiltres[i].pictures[0]}" />
          </div> ` : ''}           
          <div class="small-padding">
            <h6 class="no-margin">${articlefiltres[i].name}</h6>
            <div class="small-margin"><label>Origine : </label>${articlefiltres[i].origin}</div>
            <div class="chip large">
              <label>Prix: </label><span class="large-text">${articlefiltres[i].price.toFixed(2)} € / <span class="avoidwrap">${articlefiltres[i].unit}</span> </span>
            </div>
            <div class="row no-margin">
              <div class="col s8 field round fill border center-align">
                <input type="text" class="center-align ${articlefiltres[i].inCart ? '' : 'color-1a'}" value="${articlefiltres[i].quantity==0? '' : articlefiltres[i].quantity }" onchange="samActions.exec({do:'changerquantity', hisid: ${articlefiltres[i].id} , e : event})" />
                <label>Quantité</label>
              </div>
              <div class=" col s4">
                <button class="circle no-margin ${articlefiltres[i].quantity == 0 ? 'disabled' : ''}" ${articlefiltres[i].inCart ? '' : `onclick="samActions.exec({do:'ajoutarticle', hisid:${articlefiltres[i].id}, quantity:${articlefiltres[i].quantity}})"`} >
                  <i>${articlefiltres[i].inCart ? 'edit' : 'add'}</i>
                </button>
              </div>
            </div>
          </div>
        </div>
`


  }
    

    

    if(model.filters.search.text==''){
    if(j==0){
      var1+=  `
      <div class="row">
      <div class="col s12 medium-padding fond">
      <img class= "responsive" src="./images/fond.png" />
    </div>  
    </div> 
    `
    }}else if(k==0) {
      var1+=  `
      <div class="row">
      <div class="col s12 medium-padding fond">
      <img class= "responsive" src="./images/fond.png" />
    </div>  
    </div> 
    `
      
    }
    var1+=`</article>`
    return var1;

  },
  
  articlesListUI(model, state) {
    
    console.log('articlesListUI');
    
 
    let filtercat=state.filters.categories.booleans;
    let filterorg=state.filters.origins.booleans;
    let tabcat=model.categories;
    let taborg=model.origins;
    let artvalue=model.articles.values
    let j=0, k=0;
   
    let var1=this.html`<article class="large-margin list-view">`
    for(let i=0; i<artvalue.length; i++){
      if(model.filters.search.global==false){
      if(filtercat[artvalue[i].category]==true && filterorg[artvalue[i].origin]==true){
        j++;
        if(model.filters.search.text!=''){
        if(artvalue[i].name.toLowerCase().includes(state.filters.search.text.toLowerCase())==true){
          k++;
var1+=`<nav  class="row card divider no-wrap"> 
${model.settings.articleImages ? `         
          <div class="col min">
            <img src="./images/${artvalue[i].pictures[0]}" class="circle tiny" />
          </div> ` : ''}           
<div class="col">
  <h6>${artvalue[i].name}</h6>
  <label>${artvalue[i].origin}</label>
</div>
<div class="col min chip no-margin">
  <label>Prix : </label><span class="large-text">${artvalue[i].price} € / ${artvalue[i].unit}</span>
</div>
<div class="col min field round fill small border center-align no-margin">
  <label>Qté : </label>
  <input type="text" id="ajoutQté" value="${artvalue[i].quantity==0? '' : artvalue[i].quantity}" class="center-align ${artvalue[i].inCart ? '' : 'color-1a'}" onchange="samActions.exec({do:'changerquantity', hisid:${artvalue[i].id}, e: event})" />
</div>
<div class="col min no-margin"></div>
<div class="col min">
  <button class="circle no-margin ${artvalue[i].quantity == 0 ? 'disabled' : ''}" ${artvalue[i].inCart ? '' : `onclick="samActions.exec({do:'ajoutarticle', hisid:${artvalue[i].id}, quantity:${artvalue[i].quantity}})"`}>
    <i>${artvalue[i].inCart ? 'edit' : 'add'}</i>
  </button>
</div>
</nav>`}} else {

var1+=`<nav  class="row card divider no-wrap"> 
${model.settings.articleImages ? `         
          <div class="col min">
            <img src="./images/${artvalue[i].pictures[0]}" class="circle tiny" />
          </div> ` : ''}           
<div class="col">
  <h6>${artvalue[i].name}</h6>
  <label>${artvalue[i].origin}</label>
</div>
<div class="col min chip no-margin">
  <label>Prix : </label><span class="large-text">${artvalue[i].price} € / ${artvalue[i].unit}</span>
</div>
<div class="col min field round fill small border center-align no-margin">
  <label>Qté : </label>
  <input type="text" id="ajoutQté" value="${artvalue[i].quantity==0? '' : artvalue[i].quantity}" class="center-align ${artvalue[i].inCart ? '' : 'color-1a'}" onchange="samActions.exec({do:'changerquantity', hisid:${artvalue[i].id}, e : event})" />
</div>
<div class="col min no-margin"></div>
<div class="col min">
  <button class="circle no-margin ${artvalue[i].quantity == 0 ? 'disabled' : ''}" ${artvalue[i].inCart ? '' : `onclick="samActions.exec({do:'ajoutarticle', hisid:${artvalue[i].id}, quantity:${artvalue[i].quantity}})"`}>
    <i>${artvalue[i].inCart ? 'edit' : 'add'}</i>
  </button>
</div>
</nav>`

} 

}
    }else if(model.filters.search.text!='' ){
      if(artvalue[i].name.toLowerCase().includes(state.filters.search.text.toLowerCase())==true){
        k++;
        var1+=`<nav  class="row card divider no-wrap"> 
        ${model.settings.articleImages ? `         
                  <div class="col min">
                    <img src="./images/${artvalue[i].pictures[0]}" class="circle tiny" />
                  </div> ` : ''}           
        <div class="col">
          <h6>${artvalue[i].name}</h6>
          <label>${artvalue[i].origin}</label>
        </div>
        <div class="col min chip no-margin">
          <label>Prix : </label><span class="large-text">${artvalue[i].price} € / ${artvalue[i].unit}</span>
        </div>
        <div class="col min field round fill small border center-align no-margin">
          <label>Qté : </label>
          <input type="text" id="ajoutQté" value="${artvalue[i].quantity==0? '' : artvalue[i].quantity}" class="center-align ${artvalue[i].inCart ? '' : 'color-1a'}" onchange="samActions.exec({do:'changerquantity', hisid:${artvalue[i].id}, e: event})" />
        </div>
        <div class="col min no-margin"></div>
        <div class="col min">
          <button class="circle no-margin ${artvalue[i].quantity == 0 ? 'disabled' : ''}" ${artvalue[i].inCart ? '' : `onclick="samActions.exec({do:'ajoutarticle', hisid:${artvalue[i].id}, quantity:${artvalue[i].quantity}})"`}>
            <i>${artvalue[i].inCart ? 'edit' : 'add'}</i>
          </button>
        </div>
        </nav>`
}
}else if(filtercat[artvalue[i].category]==true && filterorg[artvalue[i].origin]==true){
  j++;
  var1+=`<nav  class="row card divider no-wrap"> 
  ${model.settings.articleImages ? `         
            <div class="col min">
              <img src="./images/${artvalue[i].pictures[0]}" class="circle tiny" />
            </div> ` : ''}           
  <div class="col">
    <h6>${artvalue[i].name}</h6>
    <label>${artvalue[i].origin}</label>
  </div>
  <div class="col min chip no-margin">
    <label>Prix : </label><span class="large-text">${artvalue[i].price} € / ${artvalue[i].unit}</span>
  </div>
  <div class="col min field round fill small border center-align no-margin">
    <label>Qté : </label>
    <input type="text" id="ajoutQté" value="${artvalue[i].quantity==0? '' : artvalue[i].quantity}" class="center-align ${artvalue[i].inCart ? '' : 'color-1a'}" onchange="samActions.exec({do:'changerquantity', hisid:${artvalue[i].id}, e: event})" />
  </div>
  <div class="col min no-margin"></div>
  <div class="col min">
    <button class="circle no-margin ${artvalue[i].quantity == 0 ? 'disabled' : ''}" ${artvalue[i].inCart ? '' : `onclick="samActions.exec({do:'ajoutarticle', hisid:${artvalue[i].id}, quantity:${artvalue[i].quantity}})"`}>
      <i>${artvalue[i].inCart ? 'edit' : 'add'}</i>
    </button>
  </div>
  </nav>`

}
      
    }
    if(model.filters.search.text==''){
      if(j==0){
        var1+=  `
        <div class="row">
        <div class="col s12 medium-padding fond">
        <img class= "responsive" src="./images/fond.png" />
      </div>  
      </div> 
      `
      }}else if(k==0) {
        var1+=  `
        <div class="row">
        <div class="col s12 medium-padding fond">
        <img class= "responsive" src="./images/fond.png" />
      </div>  
      </div> 
      `
        
      }
    var1+=`</article>`
    return var1;
    
  },
  
  articlesEmptyUI(model,state) {
  
    return this.html`
      <div class="row">
        <div class="col s12 medium-padding fond">
          <img src="./images/fond.png" class="responsive" />
        </div>
      </div>
    `;
  },
  
  paginationUI(model, state) {
    
    console.log('paginationUI',state.pagination.grid.currentPage );
    const gridOn = state.display.articlesView.value == 'grid'
  
    let laquelle = gridOn? state.pagination.grid : state.pagination.list;
    let var2=`<nav class="center-align">
    <button class="square ${laquelle.currentPage==1? 'border disabled' : ''}  "   onclick="samActions.exec({do:'before',view: '${gridOn?'grid' : 'list'}'})">
    <i>navigate_before</i>
  </button>     
    `
    console.log(state.pagination)
   for(let i=0; i<laquelle.numberOfPages; i++ ){
    var2+=`
    <button class="square no-margin ${laquelle.currentPage==i+1? 'border' : ''}" onclick="samActions.exec({do:'changePage', direction:'${i+1}', view: '${gridOn?'grid' : 'list'}'})" >${i+1}</button>           
    `;}
    var2+=`  
    <button class="square ${laquelle.currentPage==laquelle.numberOfPages? 'border disabled' : ''} " onclick="samActions.exec({do:'next',view: '${gridOn?'grid' : 'list'}'})">
    <i>navigate_next</i>
  </button>
    <div class="field suffix small">
    <select onchange="samActions.exec({do: 'changeLinesPerPage', view:'${gridOn?'grid' : 'list'}', e : event})">`
    for(let i=0; i<laquelle.linesPerPageOptions.length; i++ ){
    var2+=` 
      <option value="${laquelle.linesPerPageOptions[i]}" ${laquelle.linesPerPage==laquelle.linesPerPageOptions[i]? 'selected="selected"' : ''}  >${laquelle.linesPerPageOptions[i]} ligne par page</option>
    `
  }
  
  var2+=`
  </select>
  <i>arrow_drop_down</i>
  </div>
  </nav>`
    return var2;
  },
  
  cartUI(model, state) {

    console.log('cartUI')
    console.log(state.cart.total);
    if (!model.display.cartView) return '';
  
    // TODO
    //let artvalue=model.articles.values;
   let artvalue=state.cart.values;
    let var2;
    let i=0;
    let k=0;
    let artvalue3=model.articles.values;
    artvalue3.map((v)=>{
      if(v.selecttodelete==true && v.inCart==true){
        i++;
          }
    })
    artvalue3.map((v)=>{
      if( v.inCart==true){
        k++;
          }
    })
    var2=`      <div class="panier row small-margin">
    <div class="col s0 m1 l2"></div>
    <section class="col s12 m10 l8">
      <div class="card ">
        <h4>Panier</h4>
        <div>
          <table border="0" class="right-align large-text">
            <thead>
              <th class="center-align"><a onclick="samActions.exec({do:'sortCart',property:'name'})">
                Articles <i class="small">unfold_more</i></a></th>
              <th class="center-align"><a onclick="samActions.exec({do:'sortCart',property:'quantity'})">
                Qté<i class="small">unfold_more</i></a></th>
              <th class="center-align">Unit</th>
              <th class="center-align">P.U.</th>
              <th class="center-align"><a onclick="samActions.exec({do:'sortCart',property:'total'})">
                Prix<i class="small">unfold_more</i></a></th>
              <th>
              </th>
            </thead>`
    for(let i=0; i<artvalue.length; i++){
if(artvalue[i].inCart){
var2+=`<tr class="ligne-${(i%2===0)?'paire' : 'impaire' }">
<td class="left-align">${artvalue[i].name}</td>
<td class="quantite">
  <div class="field fill small">
    <input type="text" class="right-align" value=" ${artvalue[i].quantity}" onchange="samActions.exec({do:'changerquantity', hisid: ${artvalue[i].id} , e : event})" />
  </div>
</td>
<td class="left-align">${artvalue[i].unit}</td>
<td>${artvalue[i].price} €</td>
<td>${artvalue[i].price * artvalue[i].quantity } €</td>
<td class="center-align">
  <label class="checkbox">
    <input type="checkbox" ${artvalue[i].selecttodelete?'checked="checked"' : '' } onclick="samActions.exec({do: 'changeselect', hisid : ${artvalue[i].id} })"/>
    <span></span>
  </label>
</td>
</tr>`

}


    }
    var2+=`
    <tfoot class="orange-light-3">
    <th colspan="4">Total :</th>
    <th>${state.cart.total} €</th>
    <th class="center-align">
      <button type="button" onclick="samActions.exec({do:'cartDelete'})" 
        class="small ${ i==0 ?'disabled':''}"><i>delete</i></button>
    </th>
  </tfoot>
</table>
</div>
<div class="medium-margin right-align">
<button ${ k==0 ?'class="disabled" disabled="disabled"':'class=""'} 
  onclick="envoyerCommande('YAHI Lotfi', samState.state.cart.values, ${state.cart.total})"><i class="small-margin">send</i> Envoyer la commande</button>
</div>
</div>
</section>
</div>`

return var2;
    


  },
   
};


function envoyerCommande(client, articles, total) {
    
  // TODO
  
  let email = 'commandes@fruits-legumes.com';
  let sujet = 'Commande de ' + client;
  let corps =`Commande de fruits et légumes
  
Voici les articles commandés pour un montant de ${samView.inEuro(total)} :

`
 for(let i=0; i<articles.length; i++){
    corps+=
`-${articles[i].name +' '+ '('+ articles[i].quantity+' '+articles[i].unit+')'}
`;

  }

  email = encodeURIComponent(email);
  sujet = encodeURIComponent(sujet);
  corps = encodeURIComponent(corps);
  const uri = "mailto:" + email + "?subject=" + sujet + "&body=" + corps;
  window.open(uri);
}
