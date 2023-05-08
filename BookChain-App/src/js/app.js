try{
  const li = document.getElementById('blog-link');
  const div = document.getElementById('blog-div');

  li.onclick = function(event) {
    event.preventDefault();
    div.style.display = "block";
  };
}
catch{
  console.log("Blog in Home !");
}

try{
const image = document.getElementById("nav-img-signup");

image.addEventListener("click", function() {
  window.location.href = "signup.html";
});
}
catch{
  console.log("Button in Signup !");
}

var bookids = [];

var App = {
  contracts: {},
  // url: 'http://127.0.0.1:7545',
  url: 'https://sepolia.infura.io/v3/be7d6518907c4f96a31db6f8204bf829',

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } 
    else {
      App.web3Provider = new Web3.providers.HttpProvider(App.url);
    }
    
    web3 = new Web3(App.web3Provider);
    ethereum.enable();

    console.log('Web3 Initiated !');
    
    return App.initContract();
    
  },

  initContract: async function() {
    $.getJSON('Bookchain.json', async function(data) {
    var BookChain = data;
    App.contracts.bookchain = TruffleContract(BookChain);

    App.contracts.bookchain.setProvider(App.web3Provider);

    console.log("BookChain Inititated !");

    console.log(await web3.eth.getAccounts());
    console.log("Accounts Inititated !");
  });

  $.getJSON('Bookies.json', async function(data) {
    var Bookies = data;
    App.contracts.bookies = TruffleContract(Bookies);

    App.contracts.bookies.setProvider(App.web3Provider);
    console.log("Bookies Inititated !");
  });

  $.getJSON('BookNFT.json', async function(data) {
    var BookNFT = data;
    App.contracts.booknft = TruffleContract(BookNFT);

    App.contracts.booknft.setProvider(App.web3Provider);
    console.log("BookNFT Inititated !");
  });

  return App.bindEvents();
  },

  SendPostRequest: async function(endpoint, method, data){
    let response = await fetch(endpoint, {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    let res = await response.json();
    return res; 
  },

  bindEvents: function() {
  try{
    document.getElementById("usersignupform").addEventListener("submit", function(event) {
      event.preventDefault();
      return App.newUser();
    });
  }
  catch{

  }

  try{
    document.getElementById("newbookform").addEventListener("submit", function(event) {
      event.preventDefault();
      var form = document.querySelector("#newbookform");
      const formdata = new FormData(form);
      console.log(formdata);

      $.ajax({
        url: '/newimage',
        type: 'POST',
        data: formdata,
        processData: false,
        contentType: false,
        success: function(response) {
          let ajax_res = response;
          return App.newBook(formdata, ajax_res);
        },
        error: function(xhr, status, error) {
          console.error(error);
        }
      });
    });
  }
  catch{

  }
  },

  EventListeners: async function(status) {
    const btns = document.querySelectorAll('button');
    btns.forEach((btn) => {
      console.log(btn.id);
      btn.addEventListener("click", function(event) {
        pageurl = "bookpage.html?id="+btn.id+"&flag="+status;
        console.log(pageurl);
        window.location.href = pageurl;
      })
    })
  },

  BuySellEvent: async function() {
    try{
      // SELL
      const sellbtn = document.getElementById('btn-SELL');
      sellbtn.addEventListener("click", async function(event) {
      event.preventDefault();

      var userprice = prompt("NFT Price ( Bookies you wish to sell NFT ) : ");
      console.log(userprice);

      endpoint = "/sellbook"
      method = "POST"

      const pageurl = window.location.search;
      const urlparams = new URLSearchParams(pageurl);
      const bookid = urlparams.get('id');
      console.log(bookid);

      const data = {
        bookid: bookid,
        userprice: userprice
      };

      let res = await App.SendPostRequest(endpoint, method, data);
      console.log(res);

      window.location.href = "nft.html";
      })
    }
    catch{

    }

    try{
       // BUY
       const buybtn = document.getElementById('btn-BUY');
       buybtn.addEventListener("click", async function(event) {
         event.preventDefault();
         return App.transferBook();
 
       })
    }
    catch{

    }
    
  },

  GetTokens: async function() {
    const instance = await App.contracts.bookchain.deployed();
    let accounts = await web3.eth.getAccounts();

    let tokens = await instance.UserBalance(accounts[0]);
    console.log("Book Tokens : "+tokens)

    document.getElementById("tokencount").innerHTML = "BOOKIES : "+tokens;
  },

  GetNFTDetails: async function() {
    try{
      console.log("Inventory");
      let accounts = await web3.eth.getAccounts();
      endpoint = "/inventory"
      method = "POST"
      const data = { 
        metamaskId: accounts[0]
      };

      console.log(data);

      let res = await App.SendPostRequest(endpoint, method, data);
      var resdata = res;
      console.log(resdata);

      for(let i=0;i<resdata.length;i++){
        let array=[];
        array.push('<div class="col-lg-4">');
        array.push('<div class="card" style="width: 320px; margin-top: 5%;">')
        array.push('<img class="card-img-top" src="uploads/'+resdata[i].image+'" alt="Card image cap">');
        array.push('<div class="card-body">');
        array.push('<p class="card-text">BOOK : '+resdata[i].title+'</p>')
        array.push('<p class="card-text">AUTHOR : '+resdata[i].author+'</p>')
        array.push('<button type="submit" id="'+ resdata[i].bookid +'" class="btn-inventory">INFO</button>')
        array.push('</div>')
        array.push('</div>')
        array.push('</div>')
        
        $("#displaycards").append(array.join(''))
      }
    }
    catch{

    }

  },

  GetBookDetails: async function() {
    try{
      console.log("Bookpage");

      const pageurl = window.location.search;
      const urlparams = new URLSearchParams(pageurl);
      const bookid = urlparams.get('id');
      const flag = urlparams.get('flag');
      console.log(bookid);
      console.log(flag);

      endpoint = "/bookdata"
      method = "POST"
      const data = {
        bookid: bookid
      }

      console.log(data);

      let res = await App.SendPostRequest(endpoint, method, data);

      var resdata = res;
      console.log(resdata[0]);

      var price = 0;
      if(flag == 'SELL'){
        price = resdata[0].marketprice;
      }
      else if(flag == 'BUY'){
        price = resdata[0].userprice;
      }

      let array=[];
      array.push('<div class="column-left">');
      array.push('<img id="book-info-img" src="uploads/'+resdata[0].image+'">');
      array.push('</div>')
      array.push('<div id="book-details" class="column-right">');
      // array.push('<p style="margin-bottom: 2%; font-size: 20px;">'+resdata[0].title+'</p>')
      array.push('<p>'+resdata[0].title+'</p>')
      array.push('<div style="margin-bottom: 2%;" class="line"></div>')
      array.push('<p style="margin-bottom: 3.5%;">'+resdata[0].description+'</p>')
      array.push('<p style="margin-bottom: 2.5%;">UID : '+resdata[0].bookid+'</p>')
      array.push('<p style="margin-bottom: 2.5%;">AUTHOR : '+resdata[0].author+'</p>')
      array.push('<p style="margin-bottom: 2.5%;">EDITION : '+resdata[0].edition+'</p>')
      array.push('<p style="margin-bottom: 2.5%;">PAGES : '+resdata[0].pages+'</p>')
      array.push('<p style="margin-bottom: 2.5%;">RELEASE YEAR : '+resdata[0].release+'</p>')
      array.push('<p style="margin-bottom: 2.5%;">GENRE : '+resdata[0].genre+'</p>')
      array.push('<p style="margin-bottom: 2.5%;">FORMAT : '+resdata[0].format+'</p>')
      array.push('<p style="margin-bottom: 2.5%;">SPECIAL EDITION : '+resdata[0].special+'</p>')
      array.push('<p style="margin-bottom: 2.5%;">MARKET PRICE : '+resdata[0].marketprice+'</p>')
      array.push('<p >PRICE : '+price+'</p>')
      array.push('<form id="nfttransfer">')
      array.push('<button type="submit" id="btn-'+flag+'" class="btn btn-custom">'+flag +'</button>')
      array.push('</form>')

      $("#displaybook").append(array.join(''))
    }
    catch{

    }
  },

  GetBooks: async function() {
    try{
      console.log("Marketplace");

      endpoint = "/storebooks"
      method = "POST"
      const data = {
        upforsale: true
      };

      let res = await App.SendPostRequest(endpoint, method, data);

      var resdata = res;
      console.log(resdata);

      for(let i=0;i<resdata.length;i++){
        let array=[];
        array.push('<div class="col-lg-4">');
        array.push('<div class="card" style="width: 300px; margin-top: 5%;">')
        array.push('<img class="card-img-top" src="uploads/'+resdata[i].image+'" alt="Card image cap">');
        array.push('<div class="card-body">');
        array.push('<p class="card-text">Book : '+resdata[i].title+'</p>')
        array.push('<p class="card-text">Author : '+resdata[i].author+'</p>')
        array.push('<button type="submit" id="'+ resdata[i].bookid +'" class="btn-inventory">INFO</button>')
        array.push('</div>')
        array.push('</div>')
        array.push('</div>')
        
        $("#storecards").append(array.join(''))
      }
    }
    catch {

    }
  },

  newUser: async function() {
    try{
      var username = document.getElementById("username").value;
      var useremail = document.getElementById("emailid").value;

      const instance = await App.contracts.bookchain.deployed();
      let accounts = await web3.eth.getAccounts();

      const data = {
        username: username,
        email: useremail, 
        metamask: accounts[0],
        nft: []
      };

      endpoint = "/signup";
      method = "POST";

      let resdata = await App.SendPostRequest(endpoint, method, data);
      console.log(resdata);
      let userdbid = resdata.userdbid;
    
      let result = await instance.NewUser(accounts[0], username, userdbid, {from: accounts[0]});

      alert("User Successfully Registered !");
    }catch (err) {
      console.log("Error in generating ERC20 Tokens " + err.message);
      alert(err.message);
    }

    window.location.href = "booknft.html";
  },

  newBook: async function(formdata, ajax_res) {
    try{
      var title = formdata.get("title");
      var author = formdata.get("author");
      var bookid = formdata.get("bookid");
      var pages = formdata.get("title");
      var edition = formdata.get("edition");
      var release = formdata.get("release");
      var genre = formdata.get("genre");
      var format = formdata.get("format");
      var special = formdata.get("special");
      var description = formdata.get("description");
      var image = ajax_res;

      const instance = await App.contracts.bookchain.deployed();
      let accounts = await web3.eth.getAccounts();
    
      const data = {
        title: title,
        author: author, 
        bookid: bookid,
        pages: pages,
        edition: edition,
        release: release,
        genre: genre,
        image: image,
        format: format,
        special: special,
        description: description,
        metamask: accounts[0]
      };

      endpoint = "/newbook";
      method = "POST";

      let resdata = await App.SendPostRequest(endpoint, method, data);
      console.log(resdata);
      let bookdbid = resdata.bookdbid;

      let result = await instance.NewBook(accounts[0], bookid, title, bookdbid, {from: accounts[0]});

      alert("Book NFT Successfully Minted !");
    }catch (err) {
      console.log("Error in generating ERC20 Tokens " + err.message);
      alert(err.message);
    }

    window.location.href = "nft.html";
  },

  transferBook: async function() {
    try{
      const instance = await App.contracts.bookchain.deployed();
      let accounts = await web3.eth.getAccounts();
      const bookid = document.getElementById("bookuid").innerHTML;

      console.log(bookid);

      const data = {
        buyer: accounts[0],
        bookid: bookid
      }

      endpoint = "/buybook";
      method = "POST";

      let resdata = await App.SendPostRequest(endpoint, method, data);
      console.log("DB response done");
      const owner = resdata.owner;
      const price = resdata.price;

      let result = await instance.BuyNFT(owner, accounts[0], bookid, price, {from: accounts[0]});
      console.log(result);
      alert("Book NFT Successfully Transferred !");
    }
    catch (err) {
      console.log("Error in transferring book " + err.message);
      alert(err.message);
    }
    window.location.href = "nft.html";
  }
}

App.init();

window.addEventListener('load', async function() {
  if($('#homepage').length) {
    await App.GetTokens();
  }
  if($('#signuppage').length) {
    await App.GetTokens();
  }
  if($('#mintnft').length) {
    await App.GetTokens();
  }
  if($('#nftpage').length) {
    await App.GetTokens();
    await App.GetNFTDetails();
    await App.EventListeners('SELL');
  }
  if($('#bookpage').length) {
    await App.GetBookDetails();
    await App.BuySellEvent();
    await App.GetTokens();
  }
  if($('#storepage').length) {
    await App.GetTokens();
    await App.GetBooks();
    await App.EventListeners('BUY');
  }
});






