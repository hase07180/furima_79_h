const parentBeforeColor = new Object();
    parentBeforeColor.backgroundColor = "white";
    parentBeforeColor.color = "black";
const parentAfterColor = new Object();
    parentAfterColor.backgroundColor = "#3ccace";
    parentAfterColor.color = "white";
const childBeforeColor = new Object();
    childBeforeColor.backgroundColor = "white";
const childAfterColor = new Object();
    childAfterColor.backgroundColor = "whitesmoke";

$(function(){
  // #で始まるリンクをクリックしたら実行されます
  $('a[href^="#"]').click(function() {
    // スクロールの速度
    const speed = 400; // ミリ秒で記述
    const href= $(this).attr("href");
    const target = $(href == "#" || href == "" ? 'html' : href);
    const position = target.offset().top;
    $('body,html').animate({scrollTop:position}, speed, 'swing');
    return false;
  });
  // カテゴリーボックスの動的背景色変化
  // 親要素にmouseoverした時、親要素のcss変化（mouseoverした時も変化）
  $('.category__parent--name').mouseover(function(){
    $(this).css(parentAfterColor);
  }).mouseout(function(){
    $(this).css(parentBeforeColor);
  });

  // 子要素にmouseoverした時、子要素、子要素の親要素css変化（mouseoverした時も変化）
  $('.category__child--name').mouseover(function(){
    const parent = $(this).parent().parent().parent().children('a');
    $(this).css(childAfterColor);
    parent.css(parentAfterColor);
  }).mouseout(function(){
    const parent = $(this).parent().parent().parent().children('a');
    $(this).css(childBeforeColor);
    parent.css(parentBeforeColor);
  });

  // 孫要素にmouseoverした時、孫要素、孫要素の親要素、孫要素の祖先要素css変化（mouseoverした時も変化）
  $('.category__grandchild--name').mouseover(function(){
    const child  = $(this).parent().parent().parent().children('a');
    const parent = child.parent().parent().parent().children('a');
    $(this).css(childAfterColor);
    child.css(childAfterColor);
    parent.css(parentAfterColor);
  }).mouseout(function(){
    const child  = $(this).parent().parent().parent().children('a');
    const parent = child.parent().parent().parent().children('a');
    $(this).css(childBeforeColor);
    child.css(childBeforeColor);
    parent.css(parentBeforeColor);
  });
  function appendOption(category){
    let html = `<option value="${category.id}" >${category.name}</option>`;
    return html;
  }
  // 子カテゴリーの表示作成
  function appendChildrenBox(insertHTML){
    const childSelectHtml = `<li>
                              <select id="children_category" name="item[category_id]" required = required>
                                <option value="">選択してください</option>
                                ${insertHTML}
                              </select>
                            </li>`;
    $('.field__input--category').append(childSelectHtml);
  }
  // 孫カテゴリーの表示作成
  function appendGrandchildrenBox(insertHTML){
    
    const grandchildSelectHtml =`<li>
                                  <select id="grandchildren_category" name="item[category_id]" required = required>
                                    <option value="">選択してください</option>
                                    ${insertHTML}
                                  </select>
                                </li>`;
    $('.field__input--category').append(grandchildSelectHtml);
  }
  // 親カテゴリー選択後のイベント
  $('#parent_category').on('change', function(){
    //選択された親カテゴリーの名前を取得
    const parentName =$(this).val(); 
    const parentsError = $("#parent_category").next();
    const childrenError = $("#children_category").next();
    const grandChildrenError = $("#grandchildren_category").next();
    if (parentName != ""){ 
      //親カテゴリーが初期値でないことを確認
      $.ajax({
        url: '/items/category_children',
        type: 'GET',
        data: { parent_name: parentName },
        dataType: 'json'
      })
      .done(function(children){
         //親が変更された時、子以下を削除する
        parentsError.remove();
        childrenError.remove();
        grandChildrenError.remove();
        $('#children_category').remove();
        $('#grandchildren_category').remove();
        let insertHTML = '';
        children.forEach(function(child){
          insertHTML += appendOption(child);
        });
        appendChildrenBox(insertHTML);
      })
      .fail(function(){
        alert('カテゴリー取得に失敗しました');
      })
    }else{
      //親カテゴリーが初期値になった時、子以下を削除する
      parentsError.remove();
      childrenError.remove();
      grandChildrenError.remove();
      $('#children_category').remove();
      $('#grandchildren_category').remove();
    }
  });
  // 子カテゴリー選択後のイベント
  $('.field__input--category').on('change', '#children_category', function(){
    const childId = $(this).val();
    const childrenError = $("#children_category").next();
    const grandChildrenError = $("#grandchildren_category").next();
    //選択された子カテゴリーのidを取得
    if (childId != ""){ 
      //子カテゴリーが初期値でないことを確認
      $.ajax({
        url: '/items/category_grandchildren',
        type: 'GET',
        data: { child_id:  childId},
        dataType: 'json'
      })
      .done(function(grandchildren){
        if (grandchildren.length != 0) {
          //子が変更された時、孫以下を削除する
          childrenError.remove();
          grandChildrenError.remove();
          $("#children_category").removeClass("error");
          $('#grandchildren_category').remove();
          let insertHTML = '';
          grandchildren.forEach(function(grandchild){
            insertHTML += appendOption(grandchild);
          });
          appendGrandchildrenBox(insertHTML);
        }
      })
      .fail(function(){
        alert('カテゴリー取得に失敗しました');
      })
    }else{
      childrenError.remove();
      grandChildrenError.remove();
      $('#grandchildren_category').remove();
    }
  });
  $('.field__input--category').on('change', '#grandchildren_category', function(){
    const grandChildrenId = $(this).val();
    const grandChildrenError = $("#grandchildren_category").next();
    if (grandChildrenId != ""){ 
      grandChildrenError.remove();
    }
  });
});

