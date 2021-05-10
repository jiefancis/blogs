题意：
    以下两个数组中，数组arr1与arr2中元素的id相等则视为相同元素，此时将arr2元素的value值替换arr1中的value值。

    为什么想到diff算法呢？vue的diff算法中，对两个相同元素的子元素列表进行遍历匹配，新元素列表中存在与旧元素列表
    相同的元素时，旧元素数组中该元素进行patch补丁，以此实现dom结构的正确渲染。这道题相对简单，没有深层遍历。

  var arr1 = [
        {id:1, value:'a'},
        {id:2, value:'b'},
        {id:3, value:'c'},
        {id:20, value:'f'},
  ]
  var arr2 = [
    {id:30, value:'g'},
    {id:1, value:'d'},
    {id:2, value:'e'},
    {id:10, value:'c'},
  ]
  
  diffMerge(arr1,arr2)
  function diffMerge(arr1, arr2) {
    let result = [];
    let len1 = arr1.length - 1,
        len2 = arr2.length - 1;
    // 定义四个指针
    let s1 = 0, e1 = len1, s2 = 0, e2 = len2;
    while(s1 <= e1 && s2 <= e2) {
      let sitem1 = arr1[s1],eitem1 = arr1[e1], sitem2 = arr2[s2], eitem2 = arr2[e2]
      // 元素为null，指针向前（后）移动
      if(!sitem1) { 
        s1++; 
        sitem1=arr1[s1]
      } else if(!eitem1) {
        e1--; 
        eitem1=arr1[e1]
      } else if(!sitem2) {
        s2++
        sitem2 = arr2[s2]
      } else if(!eitem2) {
        e2--
        eitem2 = arr2[e2]
      }
      
      // 两个数组起始节点比较
      if(sitem1.id === sitem2.id) {
        let o = {id: sitem1.id, value: sitem2.value}
        result.push(o)
        s1++
        s2++
      } else if(eitem1 === eitem2.id) { // 两个数组尾部节点比较
        let o = {id: eitem1.id, value: eitem2.value}
        result.push(o)
        e1--
        e2--
      } else if(sitem1.id === eitem2.id) { // 两个数组首尾节点比较
        let o = {id: sitem1.id, value: eitem2.value}
        result.push(o)
        s1++
        e2-- 
      } else if(eitem1.id === sitem2.id) { // 两个数组首尾节点比较
        let o = {id: eitem1.id, value: sitem2.value}
        result.push(o)
        e1--
        s2++
      } else {
        // 以上方式匹配不到数组，遍历数组，查找arr1中元素是否在arr2中存在？
        let id1 = sitem1.id, flag = false;
        for(let i = s2;i <= e2; i++) {
          if(arr2[i] && arr2[i].id === id1) {
            flag = true;
            let o = {id: id1, value: arr2[i].value}
            result.push(o)
            arr2[i] = null
            break;
          }
        }
        // 如果arr1中当前元素在arr2中不存在，说明这个元素是唯一的
        if(!flag) {
          result.push(sitem1)
        }
        
        s1++
      }
    }
    
    // 两个数组长度不相等
    if(s1 < e1) {
      result.push(...arr1.filter(item => !!item).slice(s1,e1+1))
    } else if(s2 < e2) {
      result.push(...arr2.filter(item => !!item).slice(s2,e2+1))
    }
    return result
  }
  