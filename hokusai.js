/*Copyright James Skelley 2021 */

var keyup_delay_cntr = 0;


var master_config={}
var bg_wd = null
var small_wd = null
var class_wd = null
var large_wd = null
var notes_wd = null
var update_wd = null
var WINDOW_FOCUSED = 0
var global_refresh_cnt = -1
var curr_ref = null
var PAGE_IS_LIST = false

var process_funcs = []
var switcher_memory = []
//BEGIN FUNCTIONS//

var run_regex_processing = function(){

if(curr_ref == null && !PAGE_IS_LIST)
return

if(update_wd.is(':visible')){
  update_wd.hide()
  update_wd.css({  'left':'50%',
    'bottom': '50%',
    'margin-left':'-250px',
    'margin-top':'-15px'})
}


var cs = get_curr_search()
var old_uspats = cs['ref_list'].length;
var old_forpats = lib_srch_extract_forpat(cs).length;
var old_nonpats = lib_srch_extract_nonpat(cs).length;

for(var i = 0; i < process_funcs.length; i++){
process_funcs[i]();
}
process_funcs = []
var new_uspats = cs['ref_list'].length;
var new_forpats = lib_srch_extract_forpat(cs).length;
var new_nonpats = lib_srch_extract_nonpat(cs).length;

var holder = $('<div style="width:100%; position:relative"></div>')
update_wd.append(holder)
var bg = $('<div style="zIndex:-1; position:absolute; top:0px; left:0px; background-color:#9cf"></div>')
bg.width(update_wd.width())
bg.height(update_wd.height())
holder.append(bg)
var holder_inner = $('<div style="width:100%; position:relative; display:flex"></div>')
holder.append(holder_inner)
//show progress window
var st_col = 'color:blue; font-weight:bold;text-decoration:underline;'
var st = st_col
var num = new_uspats - old_uspats;
var all_zero = true
if(num == 0)
st = ""
else
all_zero = false

var sp = $('<span style="'+st+'">(+'+num+')</span>')
var d = $('<div style="flex:1;line-height:30px;"><span style="'+st+'">USPATS</span>: <b>'+new_uspats+'</b> </div>')
d.append(sp)
holder_inner.append(d)
var st = st_col
var num = new_forpats - old_forpats;
if(num == 0)
st = ""
else
all_zero = false

var sp = $('<span style="'+st+'">(+'+num+')</span>')
var d = $('<div style="flex:1;line-height:30px;"><span style="'+st+'">FORPATS</span>: <b>'+new_forpats+'</b> </div>')
d.append(sp)
holder_inner.append(d)
var st = st_col
var num = new_nonpats - old_nonpats;
if(num == 0)
st = ""
else
all_zero = false

var sp = $('<span style="'+st+'">(+'+num+')</span>')
var d = $('<div style="flex:1;line-height:30px;"><span style="'+st+'">NONPATS</span>: <b>'+new_nonpats+'</b> </div>')
d.append(sp)
holder_inner.append(d)

if(all_zero)
bg.hide()
else
bg.stop().delay(2000).fadeOut()

update_wd.stop().fadeIn(500).delay(1500).animate({left:'0px',bottom:'0px', margin:'0px'})
save_config()
}

var detect_regex_processing = function(){


//Can't use JQUERY because USPTO can't be bothered to format their HTML properly
var txt = document.documentElement.innerHTML;



if(txt.search(/<TITLE>[\s\S]{0,50} Database Search Results:/im) > 0){

PAGE_IS_LIST = 1

var regex = /HREF[\s\S]*?>([\d,]{7,11})<\/A[\s\S]*?HREF[\s\S]*?>([\s\S]*?)<\/A/igm;

while(m = regex.exec(txt)){
var d = {}
var num = m[1].replaceAll(',','')
var title = m[2]
var ref = create_default_ref()
if(window.location.href.includes('appft.uspto.gov'))
ref['pub_no'] = num
else
ref['pat_no'] = num
  add_item(ref);
}

}else if(txt.search(/<TITLE>United States Patent: /im) > 0){
   var ref = create_default_ref()
  var arr = txt.match(/Appl. No.:[\s\S]*?<b>([\s\S]*?)<\/b>/im)
   ref['app_no'] = arr[1].trim()


   var other = get_item({'app_no':ref['app_no']})
   if(other != null)
    ref = other


var arr = txt.match(/<TITLE>United States Patent:(.*?)<\/TITLE>/im)
    ref['pat_no'] = arr[1].trim()




ref['viewed'] = 1

var arr = txt.match(/References Cited[\s\S]*?U.S. Patent Documents[\s\S]*?<TABLE[\s\S]*?<\/TABLE>/im)

if(arr != null){
  var ref_txt = arr[0]

  var m = [];
  var regex = /<TD [\s\S]*?>([\d/]{7,12}?)<[\s\S]*?<\/TD><TD[\s\S]*?>([a-z\d\s]{7,20}?)<\/TD>/igm;
    res = []

    var ref_list = []
  while(m = regex.exec(ref_txt)){
      var r = create_default_ref()
      r['disclosure_date'] = Date.parse('01 ' + m[2].trim())
     r['origin_url'] = window.location.href
     r['origin'] = "Cited_By: " + ref['pat_no']
      if(m[1].includes('/')){
	  r['pub_no'] = m[1].trim()
	  ref_list.push({'pub_no': m[1].trim(), 'date':r['disclosure_date']})
      }
      else{
	  r['pat_no'] = m[1].trim()
	  ref_list.push({'pat_no': m[1].trim(), 'date':r['disclosure_date']})
      }
      res.push(r)

  }

      for(var i = 0; i < res.length; i++){
        add_item(res[i]);
      }

        ref['uspat_refs'] = ref_list
}

var arr = txt.match(/Other References[\s\S]*?[\s\S]*?<\/TABLE>/im)
if(arr != null){
  var ref_txt = arr[0]

  var m = [];
  var regex = /<br>([\s\S]*?)(?:<br|<\/[a-z]{2})/igm;
  res = []
  while(m = regex.exec(ref_txt)){
  regex.lastIndex -= 4
  res.push(m[1])
  }


    ref['nonpat_refs'] = res


}


var arr = txt.match(/Foreign Patent Documents[\s\S]*?[\s\S]*?<\/TABLE>/im)
    if(arr != null){

  var ref_txt = arr[0]

  var m = [];
  var regex = /<tr>[\s\S]*?<td align[\s\S]*?<td align[\s\S]*?>([\s\S]*?)<[\s\S]*?<td align[\s\S]*?>([\s\S]*?)<[\s\S]*?<td align[\s\S]*?>([\s\S]*?)<[\s\S]*?<\/tr>/igm;

    res = []

    while(m = regex.exec(ref_txt)){
  res.push({'num':m[1], 'date': Date.parse('01 ' + m[2].trim()),  "country": m[3].trim()})
  }
  ref['forpat_refs'] = res
}

var arr = txt.match(/<FONT size="\+1">([\s\S]*?)<\/FONT>/im)
if(arr != null){
ref['title'] = arr[1]

}

var arr = txt.match(/Applicant:[\s\S]*?<TABLE>[\s\S]*?<TR>[\s\S]*?<TR>([\s\S]*?)<\/table>/im)
if(arr != null){
arr[1] = arr[1].replace(/<[\s\S/]*?>/igm, '')
ref['applicant'] = arr[1]
}

var arr = txt.match(/Assignee:[\s\S]*?<TD[\s\S]*?>([\s\S]*?)<\/TD/im)
if(arr != null){
arr[1] = arr[1].replace(/<[\s\S/]*?>/igm, '')
arr[1] = arr[1].replace(/\n/igm, '')
ref['assignee'] = arr[1]
}

var arr = txt.match(/<TD[\s\S]{1,200}?<b>([a-z]{3,12} \d{1,2}, \d{4})<\/b>/im)

arr[1] = arr[1].replace(/<[\s\S/]*?>/igm, '')
arr[1] = arr[1].replace(/\n/igm, '')

    ref['disclosure_date'] = Date.parse(arr[1])


var arr = txt.match(/Filed:[\s\S]*?<TD[\s\S]*?<b>([\s\S]*?)<\/b>/im)
arr[1] = arr[1].replace(/<[\s\S/]*?>/igm, '')
    arr[1] = arr[1].replace(/\n/igm, '')

     ref['disclosure_date'] = Date.parse(arr[1])

ref = add_item(ref)
curr_ref = ref




    var data = {}
    lst = ['pat_no', 'app_no', 'pub_no']
      for(var j = 0; j < lst.length; j++)
      data[lst[j]] = ref[lst[j]]

    class_wd.attr('curr_ref', JSON.stringify(data))

    var cols = get_lvl_colors()
    for(var i = 0; i < cols['active'].length; i++){
      var lvl = $('<div style="flex:1; " class="lvl_select">'+i+'</div>')
      lvl.attr('lvl_val', i)
      lvl.attr('id', 'lvl_selector_'+i)
      lvl.click(function(e_i, e_lvl, e_data){
return function(){
class_wd.find('div.lvl_select_selected').removeClass('lvl_select_selected').addClass('lvl_select')
e_lvl.removeClass('lvl_select').addClass('lvl_select_selected')
var e_ref = get_item(e_data)
e_ref['rank_lvl'] = e_i
save_config()
}
}(i, lvl, data))
if(i == ref['rank_lvl'])
lvl.removeClass('lvl_select').addClass('lvl_select_selected')

    class_wd.append(lvl)
    }




}
else if(txt.search(/<TITLE>United States Patent Application:/im) > 0){
var ref = create_default_ref()
ref['origin_url'] = window.location.href
/*** APPLICATION PROCESSING ****/

   var arr = txt.match(/Appl. No.:[\s\S]*?<b>([\s\S]*?)<\/b>/im)
    ref['app_no'] = arr[1].trim()


var other = get_item({'app_no':ref['app_no']})
if(other != null)
 ref = other



var arr = txt.match(/>[\s\S]{0,3}?([\d]{10,11})[\s\S]{0,3}?</im)
ref['pub_no'] = arr[1]



ref['viewed'] = 1
 ref['origin_url'] = window.location.href
    var arr = txt.match(/<FONT size="\+1">([\s\S]*?)<\/FONT>/im)
    if(arr != null){
    ref['title'] = arr[1]

    }

    var arr = txt.match(/Applicant:[\s\S]*?<TABLE>[\s\S]*?<TR>[\s\S]*?<TR>([\s\S]*?)<\/table>/im)
    if(arr != null){
    arr[1] = arr[1].replace(/<[\s\S/]*?>/igm, '')
    ref['applicant'] = arr[1]
    }

    var arr = txt.match(/Assignee:[\s\S]*?<TD[\s\S]*?>([\s\S]*?)<\/TD/im)
    if(arr != null){
    arr[1] = arr[1].replace(/<[\s\S/]*?>/igm, '')
    arr[1] = arr[1].replace(/\n/igm, '')
    ref['assignee'] = arr[1]
    }


    var arr = txt.match(/Filed:[\s\S]*?<TD[\s\S]*?<b>([\s\S]*?)<\/b>/im)
    arr[1] = arr[1].replace(/<[\s\S/]*?>/igm, '')
        arr[1] = arr[1].replace(/\n/igm, '')

         ref['disclosure_date'] = Date.parse(arr[1])


    ref = add_item(ref)
curr_ref = ref



        var cols = get_lvl_colors()
        for(var i = 0; i < cols['active'].length; i++){
          var lvl = $('<div style="flex:1; " class="lvl_select">'+i+'</div>')
          lvl.click(function(e_i, e_lvl, e_ref){
    return function(){
    class_wd.find('div.lvl_select_selected').removeClass('lvl_select_selected').addClass('lvl_select')
    e_lvl.removeClass('lvl_select').addClass('lvl_select_selected')
    e_ref['rank_lvl'] = e_i


    save_config()
    }
    }(i, lvl, ref))
    if(i == ref['rank_lvl'])
    lvl.removeClass('lvl_select').addClass('lvl_select_selected')

        class_wd.append(lvl)
        }



}

if(curr_ref != null){
  //ITEM PAGE
    load_notes(curr_ref)
    class_wd.fadeIn(1500)
}else{
//IRRELEVANT PAGE

}


}

var load_notes = function(ref){

  $('#notes_header').html('Notes for App. No.:' + ref['app_no'])

$('#notes_txtarea').val(ref['notes'])
var data = {}
lst = ['pat_no', 'app_no', 'pub_no']
  for(var j = 0; j < lst.length; j++)
  data[lst[j]] = ref[lst[j]]

$('#notes_txtarea').attr('curr_ref', JSON.stringify(data))
  $('#notes_txtarea').keyup(function(){
    get_item(ref)['notes'] = $(this).val()
    clearTimeout(keyup_delay_cntr)
    keyup_delay_cntr = setTimeout(save_config, 800)

  })
    notes_wd.fadeIn(1500)

}

var load_init = function(){

    //BEGIN ORIENTATION//
    notes_wd = $('<div id="notes_wd" style="display:flex; flex-direction:column"><div id="notes_header" style="flex:0 0 30px; text-align:center"></div></div>')
    var txta = $('<textarea id="notes_txtarea" style="flex:1"></textarea>')
    notes_wd.append(txta)

    small_wd = $('<div id="small_wd" style=""></div>')
    var left_holder = $('<div style="flex:1; width:fit-content"></div>')
    left_holder.append($('<div style="text-align:left; width: fit-content;">Search Name: <span id="stats_search_name">'+ get_curr_search()['name']+'</span></div>'))

    var controls_holder = $('<div style="text-align:left; width: fit-content;"></div>')

    var s = $('<select id="mode_select" style="width:100px"><option value="2" selected>Passive</option><option value="1">On Request</option><option value="0">Off</option></select>')
    var bb = $('<button style="display:none">COLLECT</button>')
    bb.click(function(){
      run_regex_processing()
    })

    s.on('change', function(e_bb){
      return function(){
        var sel = $(this).find(':selected').val()
        if(sel == 1)
          e_bb.show()
        else
        e_bb.hide()
      get_curr_search()['collection_mode'] = sel
      save_config()
    }
    }(bb))

    s.val(get_curr_search()['collection_mode'])
    s.trigger('change')
    controls_holder.append($('<span>Collection Mode: </span>'))
    controls_holder.append(s)
    controls_holder.append(bb)

    left_holder.append(controls_holder)
    small_wd.append(left_holder)

    var b = $('<button value="MENU" class="inactive_button" style="font-size:12px; width:100%">MENU</button>')
    b.click(function(){
    if($(this).hasClass('active')){

      $(this).removeClass('active').addClass('inactive');
      show_large_wd(0)
    }
    else{
      $(this).removeClass('inactive').addClass('active');
      show_large_wd(1)
    }
    })
    var d = $('<div style="text-align:center;"></div>')
    d.append(b)
    left_holder.append(d)


    /*class_wd.append($('<div style="flex:1">LOW</div>'))
    class_wd.append($('<div style="flex:1">MED</div>'))
    class_wd.append($('<div style="flex:1">HIGH</div>'))
*/
    class_wd = $('<div id="class_wd" style=""></div>')
    update_wd = $('<div id="update_wd" style=""></div>')
    update_wd.hide()


    large_wd = $('<div id="large_wd" style="z-index:2; display:none; flex-direction:column"></div>')
    var d = $('<div id="large_wd_header" style="flex:0 0 30px; padding-left:10px; line-height:30px; background-color:#ddd">Panel: </div>')
    var s = $('<select id="tab_select"><option selected>Corpus - Table</option><option >Manage Searches</option></select>')
    //<option>Corpus - Force</option>
    s.change(function(){
      switcher_memory = []
    show_tab($("option:selected", this).text())
    })
    d.append(s)
    large_wd.append(d)
    large_wd.append($('<div id="large_wd_body" style="flex:1; background-color:#fff"></div>'))
     bg_wd = $('<div id="bg_wd" style="position:fixed; left:0px; top:0px; z-index:1; width:100%; height:100%; background-color:#000; display:none; "></div>')



  //BEGIN CREATE WDS//
  small_wd.hide()
  notes_wd.hide()
  class_wd.hide()
  bg_wd.hide()
  large_wd.hide()
  $('body').append(class_wd)
  $('body').append(update_wd)
  $('body').append(small_wd)
  $('body').append(notes_wd)
  $('body').append(bg_wd)
  $('body').append(large_wd)
  small_wd.fadeIn(1500)

//  bg_wd.fadeIn()
//  large_wd.fadeIn()
  $('#tab_select').trigger("change");

  //END ADD WDS//
  update_stats()

}



//begin show_large_wd
var show_large_wd = function(on){

if(on){
  if(!large_wd.is(':visible')){
    $('#tab_select').trigger("change");
    large_wd.fadeIn();
    bg_wd.fadeTo('slow', .8)
  }
}
else{
  if(large_wd.is(':visible')){
    large_wd.fadeOut();
    bg_wd.fadeOut();
  }
}
}
//end show_large_wd

var refresh_corpus_table_body = function(){
  var d_body = $('#corpus_table_body')
d_body.html('')

$('#corpus_table_body').html('')
var curr_search = get_curr_search();
      var refs = get_curr_refs();
      for(var i = 0; i < refs.length; i++){
        var ref = refs[i]
        var data = {}
        lst = ['pat_no', 'app_no', 'pub_no']
          for(var j = 0; j < lst.length; j++)
          data[lst[j]] = ref[lst[j]]
        var r = $('<div class="table_row"></div>')
        r.attr('data_ident', JSON.stringify(data))
        r.attr('data_removed', ref['removed'])
        r = func_gen_pat_row(r, ref, 0)
        ref['row_ele'] = r

        d_body.append(r);
      }



}

      var func_gen_pat_row = function(ele, lst, is_header){
          var nms = ['app_no', 'pub_no', 'pat_no', 'rank_lvl', 'Rank', 'title', 'disclosure_date',  'refs']
        for(var i = 0; i < nms.length; i++){
            if(!(nms[i] in lst)){
              lst[nms[i]] = ""
            }
        }

	  var simple_switcher = function(nm, sp){

      sp.attr('clicker_val', nm)
		  var that = function(reverse){

        switcher_memory.push(nm)
		  var res = $('#corpus_table_body div.table_row').sort(function(a, b){
		      a = $(a).attr(nm)
		      b = $(b).attr(nm)

		      if(a == "")
			  a = "0";
        if(b == "")
			      b = "0";
		      a =  parseInt(a)
		      b = parseInt(b)
		      if(reverse)
			  return (a > b) ? -1 : (a < b) ? 1 : 0;
		      else
			  return (a < b) ? -1 : (a > b) ? 1 : 0;
		  })

		      $('#corpus_table_body').append(res)
		      sp.click(function(){that(!reverse)})
		  }

		  return that

	  }



	  var d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative"><div class="center_me">'+lst['app_no']+'</div></div>')


	  if(is_header){
	      d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative"></div>')
	      var sp = $('<span class="table_header_clicker">'+lst['app_no']+'</span>')
	      sp.click(simple_switcher('data_app_no', sp))
        var d2 = $('<div class="center_me"></div>')
	     d2.append(sp)
       d.append(d2)
	  }else
	      ele.attr('data_app_no', lst['app_no'].replace('/','').replace(',','').trim())

        ele.append(d)

	d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative"><div class="center_me"></div>')


	  if(is_header){
	      d = $('<div style="flex:1; text-align:center; border-right:1px solid black;"></div>')
	      var sp = $('<span class="table_header_clicker">'+lst['pub_no']+'</span>')
	      sp.click(simple_switcher('data_pub_no', sp))
	     d.append(sp)
	  }else{
	      ele.attr('data_pub_no', lst['pub_no'].replace('/','').replace(',','').trim())

        var di = $('<div class="center_me"></div>')
        d.append(di)
        var s = $('<a href="#">'+lst['pub_no']+'</a>')
        var num = lst['pub_no'].replace('/', '')
        di.append(s)

        var url = 'https://appft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&d=PG01&p=1&u=%2Fnetahtml%2FPTO%2Fsrchnum.html&r=1&f=G&l=50&s1='+num+'.PGNR.&OS=DN/'+num+'&RS=DN/'+num
        s.click(function(e_num, e_url){
          return function(){

        if(get_curr_param('open_links_tab'))
        window.open(e_url, '_blank')
        else
        window.location.href = e_url
        }
      }(num, url))
}

	  ele.append(d)

	d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative"></div>')
  var di = $('<div class="center_me"></div>')
  d.append(di)
  var s = $('<a href="#">'+lst['pat_no']+'</a>')
  di.append(s)
  var url = 'https://patft.uspto.gov/netacgi/nph-Parser?Sect1=PTO1&Sect2=HITOFF&d=PALL&p=1&u=%2Fnetahtml%2FPTO%2Fsrchnum.htm&r=1&f=G&l=50&s1='+lst['pat_no']+'.PN.&OS=PN/'+lst['pat_no']+'&RS=PN/'+lst['pat_no']+'#'
s.click(function(e_url){
  return function(){
  if(get_curr_param('open_links_tab'))
window.open(e_url, '_blank')
else
window.location.href = e_url
}}(url))


	  if(is_header){
	      d = $('<div style="flex:1; text-align:center; border-right:1px solid black;"></div>')
	      var sp = $('<span class="table_header_clicker">'+lst['pat_no']+'</span>')
	      sp.click(simple_switcher('data_pat_no', sp))
	     d.append(sp)
	  }else
	      ele.attr('data_pat_no', lst['pat_no'].replace('/','').replace(',','').trim())

	  ele.append(d)

	  if(!is_header){

if(lst['disclosure_date'] == "UNKNOWN")
d = $('<div style="flex:1; text-align:center; position:relative; border-right:1px solid black"> <div class="center_me">UNKNOWN</div></div>')
else{
	      var date = new Date(parseInt(lst['disclosure_date']));

	      d = $('<div style="flex:1; text-align:center; position:relative; border-right:1px solid black"> <div class="center_me">'+(date.getMonth() + 1).toString().padStart(2, '0')+'-'+date.getDate().toString().padStart(2, '0')+'-'+date.getFullYear()+'</div></div>')
}

	      ele.attr('data_date', lst['disclosure_date'])
	  }else{
d = $('<div style="flex:1; text-align:center; border-right:1px solid black;"></div>')
	      var sp = $('<span class="table_header_clicker">'+lst['disclosure_date']+'</span>')
	      sp.click(simple_switcher('data_date', sp))
	     d.append(sp)
	  }

	  ele.append(d)



	d = $('<div style="flex:1; text-align:center; border-right:1px solid black">'+lst['title']+'</div>')

if(!is_header)
  	d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative"><div class="center_me">'+lst['title']+'</div></div>')


          ele.append(d)

          d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative; ">Notes</div>')

          if(!is_header){
              var ref = get_item(lst)
              d = $('<div class="row_note_holder" style="flex:1; text-align:center; border-right:1px solid black; position:relative; display:flex"></div>')
              var txtarea = $('<textarea class="row_note_txtarea"  style="flex:1"></textarea>')
              txtarea.val(ref['notes'])
              txtarea.keyup(function(){
                get_item(ref)['notes'] = $(this).val()
                //if(Date.now() - keyup_delay_cntr > 800)
                //save_config()
                clearTimeout(keyup_delay_cntr)
                keyup_delay_cntr = setTimeout(save_config, 800)
              })
              txtarea.width(d.width())
              d.append(txtarea)
          }
                  ele.append(d)




var col = "#9cf"
var txt = 'Viewed'
if(parseInt(lst['viewed']) < 1){
col = "#888"
txt = 'Not Viewed'
}

d = $('<div class="viewed_div" style="flex:0 0 100px; text-align:center; border-right:1px solid black; position:relative;  background-color:'+col+'"><div class="center_me">'+txt+'</div></div>')

  if(is_header){
      d = $('<div style="flex:0 0 100px; text-align:center; border-right:1px solid black;"></div>')
      var sp = $('<span class="table_header_clicker">'+lst['viewed']+'</span>')
      sp.click(simple_switcher('data_viewed', sp))
     d.append(sp)
  }else{
      ele.attr('data_viewed', ""+ lst['viewed'])

    }
          ele.append(d)


	d = $('<div style="flex:1; text-align:center; border-right:1px solid black">'+lst['rank_lvl']+'</div>')
  if(!is_header){
	d = $('<div style="flex:1; text-align:center; border-right:1px solid black; position:relative"><div class="center_me row_rank_lvl">'+lst['rank_lvl']+'</div></div>')
ele.attr('data_rank', ""+ lst['rank_lvl'])
  }
	  ele.append(d)

	  if(is_header){
	      	  d = $('<div style="flex:1; text-align:center; border-right:1px solid black">References</div>')
	  }else{

	      d = $('<div style="flex:1; text-align:center; border-right:1px solid black"></div>')
	      var d2 = $('<div>US: ' + lst['uspat_refs'].length + '</div>'); d.append(d2)
	      d2 = $('<div>FOR: ' + lst['forpat_refs'].length + '</div>'); d.append(d2)
	      d2 = $('<div>NON-PAT: ' + lst['nonpat_refs'].length + '</div>'); d.append(d2)
	  }
          ele.append(d)


  if(is_header){

    var d = $('<div style="flex:1; text-align:center; ">Show removed: </div>')
    var b = $('<input class="remove_button" type="checkbox"></input>')
    b.click(function(){

      set_curr_param('show_removed', $(this).prop('checked'))
      var arr = $('#corpus_table_body  div.table_row').toArray();
      for(var i = 0; i < arr.length; i++){
        var e = $(arr[i])
        if(parseInt(e.attr('data_removed')) > 0){
if($(this).prop('checked'))
e.show()
else
  e.hide()

        }
      }
  //    if($(this).prop('checked'))
    })
    d.append(b)
    ele.append(d)
  }
	  else {
      	      var d = $('<div style="flex:1; text-align:center; "></div>')
	      var b = $('<button style="cursor:pointer;" class="remove_button">REMOVE</button>')
        var b2 = $('<button style="cursor:pointer;">REMOVE CITES</button>')

var remove_multi = function(arr, or_revive){

 tot = get_curr_refs()
 for(var i = 0; i < arr.length; i++){
   var ite = arr[i]
   var targ_name = 'pat_no'
   var targ = ''
   if('pat_no' in ite)
   targ = ite['pat_no']
   else if('pub_no' in ite)
   {
     targ_name = 'pub_no'
        targ = ite['pub_no']
   }
   for(var j = 0; j < tot.length; j++){
     var ite2 = tot[j]
     if(ite2[targ_name].replace('/','') == targ.replace('/','')){
       if(or_revive < 1){  //Want to remove
       if(parseInt(ite2['row_ele'].attr('data_removed')) < 1)
ite2['row_ele'].find('.remove_button').trigger('click')

}else{  //Want to revive
  if(parseInt(ite2['row_ele'].attr('data_removed')) > 0)
ite2['row_ele'].find('.remove_button').trigger('click')
}

continue;
     }

   }

 }

}

var remove_func = function(e_ele, e_b, e_b2, e_lst, w_cites){ var that = function(wc2){

return function(){
e_b.html("REVIVE")
//e_b2.html("REVIVE CITES")
if(!get_curr_search()['show_removed'])
e_ele.hide()
e_lst['removed'] = 1
e_ele.attr('data_removed', 1)
if(wc2){

}
var that2 = function(wc3){
  return function(){

  e_b.html("REMOVE")
//  e_b2.html("REMOVE CITES")
  e_lst['removed'] = 0
  e_ele.show()
  e_b.off()
  e_b.click(that(0))
  //  e_b2.click(that(1))
    e_ele.attr('data_removed', 0)

    if(wc3){

    }

}}
  e_b.off()
e_b.click(that2(0))
//e_b2.click(that2(1))
}}
      return that(w_cites);
    }
	      b.click(remove_func(ele, b, b2, lst, 0))
        //b2.click(remove_func(ele, b, b2, lst, 1))

var remove_multi_func = function(e_b2, e_lst){
  var that = function(){
     remove_multi(e_lst['uspat_refs'], 0)
     e_b2.html('REVIVE CITES')
     e_b2.off()
     e_b2.click(function(){
       remove_multi(e_lst['uspat_refs'], 1)
       e_b2.off()
       e_b2.click(that)
       e_b2.html('REMOVE CITES')
     })
  }
  return that

}

        b2.click(remove_multi_func(b2, lst))
	      d.append(b)
       d.append(b2)
	      ele.append(d)
	  }
	  if(lst['removed'])
	      ele.hide()
        return ele;
      }
//begin show_tab()
var show_tab = function(nm){
  $('#large_wd_body').html('')

  if(nm == "Corpus - Table"){
    var d = $('<div style="border:1px solid black; display:flex; flex-direction:column; width:100%; height:100%; padding:5px"></div>')
    var d_head = $('<div style="border:1px solid black; flex: 0 0 30px; line-height:30px; background-color:#ddd; display:flex"></div>')
    var d2 = $('<div style="flex:0 0 200px">Open links in new tab:</div>')
    var cb = $('<input type="checkbox"></input>')
    cb.click(function(){
    set_curr_param('open_links_tab', $(this).prop('checked'))
    })
    d2.append(cb)
    d_head.append(d2)
    /*
    var d2 = $('<div style="flex:0 0 200px">Sort By</div>')
    d_head.append(d2)
    var d2 = $('<div style="flex:0 0 200px">Filter By</div>')
    d_head.append(d2)
    var d2 = $('<div style="flex:0 0 200px">Stats</div>')
    d_head.append(d2)
    */
    var d_body1 = $('<div  style="position:relative; flex:1; padding-bottom:10px; overflow-y:auto; "></div>')


          var r = $('<div id="corpus_table_header" class="table_header"></div>')
      r = func_gen_pat_row(r, {'app_no':'App. No.', 'pat_no':'Pat. No.', 'pub_no':'Pub. No.', 'disclosure_date':'Date', 'viewed':'Viewed', 'rank_lvl':'Rank', 'title':'Title',  'refs':'References', 'removed':0}, 1)
          d_body1.append(r)
d_body1.append($('<div id="corpus_table_body"></div>'))

    d.append(d_head)
    d.append(d_body1)
    $('#large_wd_body').append(d)

refresh_corpus_table_body();


  } else if(nm == "Corpus - Force"){

  } else if(nm == "Manage Searches"){
lib_srch_populate_menu()
  }

}
//end show_tab()

var update_stats = function(){

var tot = get_curr_refs()


//  $('#total_ref_stat').html(get_curr_param('ref_list').length)
$('#stats_search_name').html(get_curr_param('name'))

}

var get_curr_refs = function(){
var cs = master_config['curr_search_id']
for(var i = 0; i < master_config['searches'].length; i++){
  if(master_config['searches'][i]['id'] == cs)
  return master_config['searches'][i]['ref_list']
}
return []
}



var get_lvl_colors = function(){
  var ans = {'active':['hsl(120,0%,80%)'], 'inactive':['hsl(120,0%,50%)']}
  var lvl_cnt = get_curr_param('num_rank_lvls')

  var delt = Math.round(100 / (lvl_cnt-1))

  for (var i = 0; i < lvl_cnt; i++){
    ans['active'].push('hsl('+(i*delt)+',100%,50%)')
    ans['inactive'].push('hsl('+(i*delt)+',50%,80%)')
  }

  return ans
}


var get_curr_search = function(){


var cs = master_config['curr_search_id']
for(var i = 0; i < master_config['searches'].length; i++){


  if(master_config['searches'][i]['id'] == cs){

  return master_config['searches'][i]
  }
}
return []

}

var get_curr_param = function(nm){

var cs = master_config['curr_search_id']
for(var i = 0; i < master_config['searches'].length; i++){
  if(master_config['searches'][i]['id'] == cs)
  return master_config['searches'][i][nm]
}
return []

}

var set_curr_param= function(nm, val){

var cs = master_config['curr_search_id']
for(var i = 0; i < master_config['searches'].length; i++){
  if(master_config['searches'][i]['id'] == cs){
    master_config['searches'][i][nm] = val
    return;
}
}

}

var reconcile_items = function(existing, other){
  var lst = Object.keys(create_default_ref())

  lst.splice(lst.indexOf('disclosure_date'),1)
  lst.splice(lst.indexOf('row_ele'),1)
  lst.splice(lst.indexOf('notes'),1)

//  var lst = ['pat_no', 'app_no', 'pub_no']

  for(var j = 0; j < lst.length; j++){
if(Array.isArray(existing[lst[j]])){
  if(existing[lst[j]].length < other[lst[j]].length)
  existing[lst[j]] = other[lst[j]]
}else if(existing[lst[j]] != other[lst[j]]){
  existing[lst[j]] = other[lst[j]]
}

  }
  if(existing['disclosure_date'] == "" || existing['disclosure_date'] > other['disclosure_date'] || existing['disclosure_date'] =="UNKNOWN")
  existing['disclosure_date'] = other['disclosure_date']

}

var get_item = function(fields){
var lst = ['pat_no', 'app_no', 'pub_no']
var cs = get_curr_search()

for(var i = 0; i < cs['ref_list'].length; i++){
  var existing = cs['ref_list'][i];
  for(var j = 0; j < lst.length; j++){

    if(lst[j] in fields && fields[lst[j]].length > 0 && fields[lst[j]] == existing[lst[j]]  && existing[lst[j]].length > 0)
    return existing;
  }
}
return null
}

var add_item = function(other){

var cs = get_curr_search()

for(var i = 0; i < cs['ref_list'].length; i++){
var existing = cs['ref_list'][i];
var lst = ['pat_no', 'app_no', 'pub_no']
for(var j = 0; j < lst.length; j++){
  if(lst[j] in other && other[lst[j]] == existing[lst[j]] && other[lst[j]].length > 0 && existing[lst[j]].length > 0){

    reconcile_items(existing, other)

    return existing
  }
}
  }
  var the_func = function(e_cs, e_other){
return function(){e_cs['ref_list'].push(e_other)
}
}(cs, other)
  process_funcs.push(the_func)
update_stats()
return other
}

var save_config = function(){

  refresh_func()


//PREPARE FOR CLONING

for(var i = 0; i < master_config['searches'].length; i++){
  var srch = master_config['searches'][i]
  for(var j = 0; j < srch['ref_list'].length; j++){
    srch['ref_list'][j]['row_ele'] = -1
}
}

get_curr_search()['last_update'] = Date.now()
    chrome.runtime.sendMessage({msg: "save_config", config:master_config}, function(response) {

//	  chrome.runtime.sendMessage({msg: "update_config", config:master_config}, function(response) {});

  });

}

var create_default_ref = function(){

var r = {
'app_no': '',
'pub_no': '',
'pat_no': '',
'viewed':0,
'rank_lvl':0,
'title':'',
'parents':[],
'children':[],
'notes':'',
    'uspat_refs':[],
    'forpat_refs':[],
    'nonpat_refs':[],
'seen_in_url':[],
    'disclosure_date':'UNKNOWN',
    'origin':'',
    'origin_url':window.location.href,
    'removed':0,
    'row_ele':$('<div></div>')

}
    return r;
}




//END FUNCTIONS/

//bg_pg.then(onGot, onError);
//var small_tab = bg_pg.small_tab
//var large_tab = bg_pg.large_tab
//END ORIENTATION//


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.msg === "update_reload"){


      Object.assign(master_config, request.config);
refresh_func()

    }
  });


  var refresh_func = function(){

    /**** BEGIN MODE ****/

    if($('#mode_select').find(':selected').val() != get_curr_search()['collection_mode'])
    {
      $('#mode_select').val(get_curr_search()['collection_mode'])
      $('#mode_select').trigger('change')
    }

  /**** END MODE ****/

    /**** BEGIN NOTES ****/
    if($('#notes_txtarea').is(':visible')){

    var ref = get_item(JSON.parse($('#notes_txtarea').attr('curr_ref')))
if(ref != null){
      if(ref['notes'] != $('#notes_txtarea').val())
      $('#notes_txtarea').val(ref['notes'])
      }
    }
  /**** END NOTES ****/
  /**** BEGIN CLASS ****/
  if(class_wd != null && class_wd.is(':visible')){
  var ref = get_item(curr_ref)
  if(ref != null){
  var val = class_wd.find('div.lvl_select_selected').attr('lvl_val')
  if(val != ref['rank_lvl'])
  $('#lvl_selector_'+ref['rank_lvl']).click()
}
}
  /**** END CLASS ****/

  /**** BEGIN CORPUS ****/
  //update then add

  if(WINDOW_FOCUSED)
  return

if($('#tab_select').find(":selected").text() == "Corpus - Table"){

refresh_corpus_table_body()
var r = $('<div id="corpus_table_header" class="table_header"></div>')
r = func_gen_pat_row(r, {'app_no':'App. No.', 'pat_no':'Pat. No.', 'pub_no':'Pub. No.', 'disclosure_date':'Date', 'viewed':'Viewed', 'rank_lvl':'Rank', 'title':'Title',  'refs':'References', 'removed':0}, 1)
$('#corpus_table_header').replaceWith(r)
var switcher_memory_tmp = switcher_memory.slice()
for(var i = 0; i < switcher_memory_tmp.length; i++){
$('span.table_header_clicker[clicker_val="'+switcher_memory_tmp[i]+'"]').click()
}
switcher_memory = switcher_memory_tmp
//reapply sorts and filters


}




  /**** END CORPUS ****/

  }




$(document).ready(function(){


  window.onfocus =  function(){WINDOW_FOCUSED = 1;};
window.onblur =  function(){WINDOW_FOCUSED = 0;};
  //BEGIN MESSAGING
  chrome.runtime.sendMessage({msg: "get_config"}, function(response) {



    master_config = response.config;

  load_init()
  detect_regex_processing()
  //  save_config()
      if(get_curr_search()['collection_mode'] == 2)
      run_regex_processing()
  });
})


window.addEventListener("pageshow", function ( event ) {

var hp = event.persisted ||
( typeof window.performance != "undefined" &&
window.performance.navigation.type === 2 );
if ( hp) {
// Handle page restore.
window.location.reload();
}
});
