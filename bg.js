
/*Copyright James Skelley 2021 */

var master_config = {}

chrome.storage.local.clear(function() {
    var error = chrome.runtime.lastError;
    if (error) {
        console.error(error);
    }
});


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {


    if (request.msg === "get_config"){

      var config = {'preferences':{},
      'SEARCH_CNT':1,
    'curr_search_id':0,
      'searches':[{'name': 'default',
      'id':0,
            'collection_mode':2,
      'date_created':Date.now(),
        'last_update':Date.now(),
        'show_removed':0,
        'num_rank_lvls':3,
        'open_links_tab':0,
        'ref_list':[]}]}



    chrome.storage.local.get({'config':config},  function(c) {
        config = c.config
        master_config = config;
    sendResponse({'config': config});
    });

    return true;


  }else if(request.msg === "save_config"){

if(JSON.stringify(master_config) === JSON.stringify(request.config))
return

    chrome.storage.local.set({ 'config':request.config}, function(){
      master_config = request.config
      chrome.tabs.query({}, function(tabs) {
        var message = {msg: 'update_reload', config:request.config};
        for (var i=0; i<tabs.length; i++) {

          if(sender.tab.id == tabs[i].id)
          continue

              chrome.tabs.sendMessage(tabs[i].id, message);
        }
    });

    });
  }
});
