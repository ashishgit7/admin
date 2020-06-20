async function seenbar(){
    seen=[];
    var val={};
  await firebase.firestore().collection('referedTenant').get().then((res) =>{ 
       res.docs.forEach( (doc)=> {
           val= doc.data();
           if(val.seen==false)
            return;

           val['id'] = doc.id;
           seen.push(val)
       })
   }) 
//   console.log(val)
  
   
   var element = document.getElementById("seenTable");
   var box = document.getElementById("unseen");
   box.style.display = "none"
   box = document.getElementById("seen");
   box.style.display = "block"
//    console.log(element)
   
   element.innerHTML=""
   seen.forEach((doc)=>{
   //    console.log(doc) 
      var tag1 = document.createElement("input");
      tag1.setAttribute('type','checkbox');
      tag1.setAttribute('name','seenCheckbox');
      tag1.setAttribute('id',doc.id);
      tag1.checked=true

   tableRow = document.createElement("tr");
   tenantName = document.createElement("td")
   tenantCity = document.createElement("td")
   tenantPhone = document.createElement("td")
   userName = document.createElement("td")
   userPhone = document.createElement("td")
   mark = document.createElement("td")
   mark.appendChild(tag1)
   tenantName.innerText = doc.tenantName;
   tenantPhone.innerHTML = doc.tenantPhone;
   tenantCity.innerHTML = doc.tenantCity;
   userName.innerHTML = doc.userName;
   userPhone.innerHTML = doc.userPhone;
   tableRow.appendChild(tenantName)
   tableRow.appendChild(tenantPhone)
   tableRow.appendChild(tenantCity)
   tableRow.appendChild(userName)
   tableRow.appendChild(userPhone)
   tableRow.appendChild(mark)
//    console.log(tdpropertymark)
   element.appendChild(tableRow)
   })
}
///
async function unseenbar(){
    seen=[];
    var val={};
  await firebase.firestore().collection('referedTenant').get().then((res) =>{ 
       res.docs.forEach( (doc)=> {
           val= doc.data();
           if(val.seen==true)
            return;

           val['id'] = doc.id;
           seen.push(val)
       })
   }) 
//   console.log(val)
  
   
   var element = document.getElementById("unseenTable");
   var box = document.getElementById("seen");
   box.style.display = "none"
   box = document.getElementById("unseen");
   box.style.display = "block"
//    console.log(element)
   
   element.innerHTML=""
   seen.forEach((doc)=>{
   //    console.log(doc) 
      var tag1 = document.createElement("input");
      tag1.setAttribute('type','checkbox');
      tag1.setAttribute('name','unseenCheckbox');
      tag1.setAttribute('id',doc.id);
      tag1.checked=false

   tableRow = document.createElement("tr");
   tenantName = document.createElement("td")
   tenantCity = document.createElement("td")
   tenantPhone = document.createElement("td")
   userName = document.createElement("td")
   userPhone = document.createElement("td")
   mark = document.createElement("td")
   mark.appendChild(tag1)
   tenantName.innerText = doc.tenantName;
   tenantPhone.innerHTML = doc.tenantPhone;
   tenantCity.innerHTML = doc.tenantCity;
   userName.innerHTML = doc.userName;
   userPhone.innerHTML = doc.userPhone;
   tableRow.appendChild(tenantName)
   tableRow.appendChild(tenantPhone)
   tableRow.appendChild(tenantCity)
   tableRow.appendChild(userName)
   tableRow.appendChild(userPhone)
   tableRow.appendChild(mark)
//    console.log(tdpropertymark)
   element.appendChild(tableRow)
   })
}


function updateUnseenVisit(){
    input = document.getElementsByName( 'unseenCheckbox' )
    input.forEach((box)=>{
        if(box.checked==true){
            var ID = box.id
            console.log(ID)
            var seen = true;
            firebase.firestore().collection('referedTenant').doc(ID).update({
                  seen
            })
        }
    })
    unseenbar()
    // console.log(input)
}
function updateSeenVisit(){
    input = document.getElementsByName( 'seenCheckbox' )
    input.forEach((box)=>{
        if(box.checked==false){
            var ID = box.id
            console.log(ID)
            var seen = false;
            firebase.firestore().collection('referedTenant').doc(ID).update({
                  seen
            })
        }
    })
    seenbar()
    // console.log(input)
}