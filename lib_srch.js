
/*Copyright James Skelley 2021 */
var lib_srch_gen_menu_region = function(title){
var outer = $('<div class="menu_region"></div>');
var head = $('<div class="menu_region_header">'+title+'</div>');
var inner_body = $('<div class="menu_region_body"></div>');

outer.append(head)
outer.append(inner_body)

return {'outer':outer, 'head':head, 'inner': inner_body};
}
function lib_srch_download_csv_arr(arr, nm){
lib_srch_downloadFile(new File([lib_srch_arr_to_csv(arr)], nm));
}


var lib_srch_changename = function(id, oldname, newname){
var safe = true;
  for(var j = 0; j < master_config['searches'].length; j++){

  if (master_config['searches'][j]['name'] == newname)
    {safe = false;
      break;}
  }
  if(!safe)
return false;

for(var j = 0; j < master_config['searches'].length; j++){

if (master_config['searches'][j]['id'] == id)
  {master_config['searches'][j]['name'] = newname
update_stats()
    break;}
}
save_config()
return true;
}

var lib_srch_addsearch = function(nm){
var tmp = {'name': nm,
  'id': master_config['SEARCH_CNT'],
        'collection_mode':2,
  'date_created':Date.now(),
  'last_update':Date.now(),
  'show_removed':0,
  'num_rank_lvls':3,
  'open_links_tab':0,
  'ref_list':[]}
  master_config['SEARCH_CNT']++;
master_config['searches'].push(tmp)
save_config()
return tmp
}

var lib_srch_removesearch = function(id){

  for(var i = 0; i < master_config['searches'].length; i++){
    if(master_config['searches'][i]['id'] === id){
      master_config['searches'].splice(i, 1);
      save_config()
      break
    }
  }
}

var lib_srch_populate_menu = function(){

$('#large_wd_body').html('');
var holder = $('<div style="width:100%; height:100%; display:flex; flex-direction:row"></div>');

var holder_left = $('<div style="flex:1; display:flex"></div>');
holder.append(holder_left)

$('#large_wd_body').append(holder)

var men1 = lib_srch_gen_menu_region('Manage Search Records')
holder_left.append(men1['outer'])
var inner_body = men1['inner']
var head = men1['head']
var b= $('<button>NEW</button>')

b.click(function(){
var r =   $('<div class="table_row" ></div>')
var cnt = 0;
var tmp_name = 'default'
for(var i = 0; i < master_config['searches'].length; i++){
  if(master_config['searches'][i]['name'] === tmp_name){
    i = -1
    cnt++
    tmp_name = 'default' + ' ('+cnt+')'
  }
}

tmp = lib_srch_addsearch(tmp_name);

r = func_gen_search_row(r, {'search_id':tmp['id'], 'search_name':tmp_name, 'date_generated':'Date Generated', 'search':tmp}, 0)
r.insertAfter('#search_table_header')
})

head.append(b)
var butt = $('<button>IMPORT</button>')
butt.click(function(){
var inp = $('<input id="file-input" type="file" name="name" style="display: none;" />')
inp.change(function(e_inp){
  return function(){
var f = inp.prop('files')[0];
f.text().then(function(txt){inp.remove();
var srch = JSON.parse(txt);
var cnt = 0;
var tmp_name = srch['name']
for(var i = 0; i < master_config['searches'].length; i++){
  if(master_config['searches'][i]['name'] === tmp_name){
    i = -1
    cnt++
    tmp_name = srch['name'] + ' ('+cnt+')'
  }
}
srch['name'] = tmp_name
srch['id'] = master_config['SEARCH_CNT']
master_config['SEARCH_CNT']++
master_config['searches'].push(srch)
lib_srch_refresh_srch_table_body();
})
}
}(inp))
$('body').append(inp)
inp.trigger('click');

})

head.append(butt)
inner_body.css('overflow', 'auto')
inner_body.attr('id', 'searches_table_body')
inner_body.css('position', 'relative')


lib_srch_refresh_srch_table_body();

}

var lib_srch_set_sel_search = function(nm){

$('.sel_button[data_srch_id!="'+nm+'"]').show()
$('.sel_button[data_srch_id="'+nm+'"]').hide()
$('.selected_fill[data_srch_id!="'+nm+'"]').hide()
$('.selected_fill[data_srch_id="'+nm+'"]').show()

master_config['curr_search_id'] = nm
update_stats()
save_config()
}

var func_gen_search_row = function(ele, vals, is_header){
  var b_sel = $('<button class="sel_button" data_srch_id="'+vals['search_id']+'" >Select</button>')
    var sel_fill = $('<div class="selected_fill" data_srch_id="'+vals['search_id']+'"><div class="center_me">SELECTED</div></div>')
    sel_fill.hide()

  b_sel.click(function(){
lib_srch_set_sel_search(vals['search_id'])
  })

   var d = $('<div style="flex:0 0 150px; text-align:center; border-right:1px solid black; position:relative"></div>')
   var dd = $('<div class="center_me">')
   dd.append(b_sel)
   d.append(dd)
   d.append(sel_fill)
   if(is_header)
   d = $('<div style="flex:0 0 150px;  text-align:center; border-right:1px solid black; position:relative">'+vals['search_name']+'</div>')
   ele.append(d)
   var d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative"></div>')
   var d2 = $('<div class="center_me"></div>')
   d.append(d2)
   var nm_ele = $('<span>'+vals['search_name']+'</span>')
   var nm_butt = $('<button>Change Name</button>')
   d2.append(nm_ele)
   d2.append(nm_butt)
   var the_func = function(){
     var txt = $('<input type="text" value="'+nm_ele.html()+'"></input>')
     nm_ele.replaceWith(txt)
     var old_name = nm_ele.html()
     nm_butt.html('Submit')
    var the_func2 = function(){
      var new_name = txt.val()

      if(old_name == new_name)
      {}
      else if(!lib_srch_changename(vals['search_id'], old_name, new_name)){
      alert('Name "'+new_name+'" already taken')
      nm_ele.html(old_name)
    }else{
      nm_ele.html(new_name)
    }

      nm_butt.html('Change Name')
      txt.replaceWith(nm_ele)
      nm_butt.unbind()
      nm_butt.click(the_func)
    }
    nm_butt.unbind()
     nm_butt.click(the_func2)

   }
   nm_butt.click(the_func)
   if(is_header)
   d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative"><div class="center_me">'+vals['search_name']+'</div></div>')
   ele.append(d)

   var d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative"></div>')
   if(is_header)
   {d.append($('<div class="center_me">Summary</div>'))}
   else
   {
var dd = $('<div class="center_me" style="display:flex; flex-direction:column; flex-wrap: wrap;"></div>')

var gen_date = function(str){
  str = parseInt(str)
  if(isNaN(str))
  return "";
        var date = new Date(str)
return (date.getMonth() + 1).toString().padStart(2, '0')+'-'+date.getDate().toString().padStart(2, '0')+'-'+date.getFullYear() + ' ' + date.toLocaleTimeString('en-US')
}

var de = $('<div><u>Date Created</u>: '+gen_date(vals['search']['date_created'])+'</div>')
dd.append(de)
de = $('<div><u>Last Updated</u>: '+gen_date(vals['search']['last_update'])+'</div>')
dd.append(de)
de = $('<div><u>USPAT Count</u>: '+ vals['search']['ref_list'].length +' </div>')
dd.append(de)
var fp = lib_srch_extract_forpat(vals['search'])
var np = lib_srch_extract_nonpat(vals['search'])
de = $('<div><u>FORPAT Count</u>: '+fp.length+' </div>')
dd.append(de)
de = $('<div><u>NONPAT Count</u>: '+np.length+' </div>')
dd.append(de)

     d.append(dd)
   }
   ele.append(d)

   var d = $('<div style="flex:0 0 140px; text-align:center; border-right:1px solid black; position:relative"></div>')
   if(is_header){
      d.append($('<div class="center_me">Export Record</div>'))
   }else{
     var dd = $('<div></div>')
    var clk = $('<button style="width:100%">EXPORT SEARCH</button>')
    clk.click(function(){
      var date = new Date()
      date = (date.getMonth() + 1).toString().padStart(2, '0')+'_'+date.getDate().toString().padStart(2, '0')+'_'+date.getFullYear() + '_' + date.getHours().toString().padStart(2, '0') + 'H_'+date.getMinutes().toString().padStart(2, '0') + "M_" + date.getSeconds().toString().padStart(2, '0') + "S"
      var nm = 'entire_SEARCH_'+encodeURIComponent(get_curr_search()['name']) + '_' + date

    lib_srch_downloadFile(new File([JSON.stringify(get_curr_search())],    nm))
    })
dd.append(clk)
     d.append(dd)
     var dd = $('<div></div>')
    var clk = $('<button style="width:100%">EXPORT USPATS - CSV</button>')
    clk.click(function(){
      var date = new Date()
      date = (date.getMonth() + 1).toString().padStart(2, '0')+'_'+date.getDate().toString().padStart(2, '0')+'_'+date.getFullYear() + '_' + date.getHours().toString().padStart(2, '0') + 'H_'+date.getMinutes().toString().padStart(2, '0') + "M_" + date.getSeconds().toString().padStart(2, '0') + "S"
      var nm = 'USPATS_SEARCH_'+encodeURIComponent(get_curr_search()['name']) + '_' + date + '.csv'

    lib_srch_download_csv_arr(lib_srch_gen_uspat_csv(vals['search']), nm)
    })
dd.append(clk)
     d.append(dd)
     var dd = $('<div></div>')
    var clk = $('<button style="width:100%">EXPORT FORPATS - CSV</button>')
    clk.click(function(){
          var date = new Date()
      date = (date.getMonth() + 1).toString().padStart(2, '0')+'_'+date.getDate().toString().padStart(2, '0')+'_'+date.getFullYear() + '_' + date.getHours().toString().padStart(2, '0') + 'H_'+date.getMinutes().toString().padStart(2, '0') + "M_" + date.getSeconds().toString().padStart(2, '0') + "S"
      var nm = 'FORPATS_SEARCH_'+encodeURIComponent(get_curr_search()['name']) + '_' + date + '.csv'

    lib_srch_download_csv_arr(lib_srch_gen_forpat_csv(vals['search']), nm)
    })
dd.append(clk)
     d.append(dd)
     var dd = $('<div></div>')
    var clk = $('<button style="width:100%">EXPORT NONPATS - CSV</button>')
    clk.click(function(){
            var date = new Date()
      date = (date.getMonth() + 1).toString().padStart(2, '0')+'_'+date.getDate().toString().padStart(2, '0')+'_'+date.getFullYear() + '_' + date.getHours().toString().padStart(2, '0') + 'H_'+date.getMinutes().toString().padStart(2, '0') + "M_" + date.getSeconds().toString().padStart(2, '0') + "S"
      var nm = 'NONPATS_SEARCH_'+encodeURIComponent(get_curr_search()['name']) + '_' + date + '.csv'

    lib_srch_download_csv_arr(lib_srch_gen_nonpat_csv(vals['search']), nm)
    })
dd.append(clk)
     d.append(dd)
   }

   ele.append(d)



   var d = $('<div style="flex:0 0 120px; text-align:center; border-right:1px solid black; position:relative"></div>')
   if(is_header){
      d.append($('<div class="center_me">Remove Record</div>'))
   }else{
     var b = $('<button>REMOVE</button>')
     b.click(function(){
        lib_srch_removesearch(vals['search_id'])
        ele.remove()
     })
     var dd = $('<div class="center_me"></div>')
     dd.append(b)
     d.append(dd)
   }
   ele.append(d)

return ele;

  /*
  b = $('<button>EXPORT JSON</button>')
  r.append(b)
  d = $('<div style="flex:0 0 200px; text-align:right"></div>')

  var b = $('<div><button style="width:200px">EXPORT CSV - USPATS</button></div>')
  d.append(b)
  var b = $('<div><button style="width:200px">EXPORT CSV - FORPATS</button></div>')
  d.append(b)
  var b = $('<div><button style="width:200px">EXPORT CSV - NONPATS</button></div>')
  d.append(b)
  r.append(d)
  d = $('<button>REMOVE</button>')
  r.append(d)
*/

}


var lib_srch_refresh_srch_table_body = function(){

  var d_body = $('#searches_table_body')
d_body.html('')

var srchs = master_config['searches']



    var r = $('<div id="search_table_header" class="table_header"></div>')

r = func_gen_search_row(r, {'search_id':-1, 'search_name':'Search Name', 'date_generated':'Date Generated', 'search':null}, 1)

d_body.append(r)

      for(var i = 0; i < srchs.length; i++){
        var s = srchs[i]
        var r =   $('<div class="table_row" ></div>')
        r = func_gen_search_row(r, {'search_id':s['id'], 'search_name':s['name'], 'date_generated':'Date Generated', 'search':s}, 0)
        d_body.append(r);
      }

//save_config()
lib_srch_set_sel_search(master_config['curr_search_id'])
}


var lib_srch_arr_to_csv = function(table){
      return  table.map(a => a.join(",")).join("\n");
}


function lib_srch_downloadFile(file) {

  const a = document.createElement("a");
  a.style.display = "none";
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.parentNode.removeChild(a);
  }, 0);
}

function lib_srch_download_csv_arr(arr, nm){
lib_srch_downloadFile(new File([lib_srch_arr_to_csv(arr)], nm));
}


function lib_srch_extract_nonpat(srch){
var ans = []
for(var i = 0; i < srch['ref_list'].length; i++){
  var s = srch['ref_list'][i]['nonpat_refs']
    for(var j = 0; j < s.length; j++){
      var ref = s[j]
  ans.push(ref)
    }
}

ans.filter(function (value, index, self) {
  return self.indexOf(value) === index;
});
return ans
}

function lib_srch_extract_forpat(srch){
  var ans = []

  for(var i = 0; i < srch['ref_list'].length; i++){
    var s = srch['ref_list'][i]['forpat_refs']
      for(var j = 0; j < s.length; j++){
        var ref = s[j]
    ans.push(ref['num'] + '_' + ref['country'] + '_' + ref['date'])
      }
  }

  ans.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
  return ans

}

function lib_srch_gen_uspat_csv(srch){
  var ans = []
  var gen_date = function(str){
    str = parseInt(str)
    if(isNaN(str))
    return "";

      var date = new Date(str)
    return (date.getMonth() + 1).toString().padStart(2, '0')+'-'+date.getDate().toString().padStart(2, '0')+'-'+date.getFullYear();
  }
  var lst = [
    {header:'App No', valname:'app_no'},
    {header:'Pat No', valname:'pat_no'},
    {header:'Pub No', valname:'pub_no'},
    {header:'Title', valname:'title'},
    {header:'Date', valname:'disclosure_date', val_func:gen_date},
    {header:'Rank Level', valname:'rank_lvl'},
    {header:'Viewed', valname:'viewed'},
    {header:'URL Acquired', valname:'origin_url'}]

  var header = []
  for(var j = 0; j < lst.length; j++)
  header.push(lst[j]['header'])
  header.push('Search Name')
  ans.push(header)

  for(var i = 0; i < srch['ref_list'].length; i++){
var ref = srch['ref_list'][i]
var tmp_row = []
    for(var j = 0; j < lst.length; j++){
      var v = String(ref[lst[j].valname]).replace(/[\n\r,]/g,'')
      if('val_func' in lst[j])
      v = lst[j].val_func(v)
      tmp_row.push(v)
}
tmp_row.push(srch['name'])
ans.push(tmp_row)
  }


  return ans

}


function lib_srch_gen_forpat_csv(srch){
  var ans = []
  var lst = [
    {header:'Pat No', valname:'pat_no'},
    {header:'Country', valname:'pub_no'},
    {header:'Date', valname:'disclosure_date'}]

  var header = []
  for(var j = 0; j < lst.length; j++)
  header.push(lst[j]['header'])
  header.push('Search Name')
  ans.push(header)

  var forpats = lib_srch_extract_forpat(srch)

  for(var i = 0; i < forpats.length; i++){
var ref = forpats[i].split('_')
var tmp_row = []
    for(var j = 0; j < lst.length; j++){
tmp_row.push(ref[lst[j].valname])
}
tmp_row.push(srch['name'])
ans.push(tmp_row)
  }

  return ans

}



function lib_srch_gen_nonpat_csv(srch){
  var ans = []

  var header = []
  header.push('Reference')
  header.push('Search Name')
  ans.push(header)

  var nonpats = lib_srch_extract_nonpat(srch)
  for(var i = 0; i < nonpats.length; i++){
var tmp_row = []
tmp_row.push('"'+nonpats[i].replace(/"/g, '""').replace(/[\r\n]/g, '')+'"')
tmp_row.push(srch['name'])
ans.push(tmp_row)
  }

  return ans

}
