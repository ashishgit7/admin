var checkBoxID = [];

async function showUsers(){

	document.getElementById('users_btn').style.backgroundColor = 'white';
	document.getElementById('request_btn').style.backgroundColor = 'rgba(0,0,0,0.2)';

	var arrID = [];
	await firebase.firestore().collection('userProfile').get().then(res =>{

		res.forEach((element) => {
			arrID.push(element.id)
		});
	});

	arrID.forEach( async function(element) {

		var checked = ""
		var reg;
		await firebase.firestore().collection('registeredUser').doc(element).get().then(response => {

			if(response.data().registered)
				checked = "checked";
			else
				checked = "";


			if(checked)
				reg = 'Registered';
			else 
				reg = 'Unregistered';

		}).catch(err =>{
			checked = "";
			if(checked)
				reg = 'Registered';
			else 
				reg = 'Unregistered';
		})


		await firebase.firestore().collection('userProfile').doc(element).get().then(res =>{
			var img,flag = false;

			if(res.data().personal === undefined){
				if((/@/).test(element)){
					img = "https://img.favpng.com/21/13/5/user-profile-default-computer-icons-network-video-recorder-png-favpng-7dPZA8WRdY80Uw3bdMWkEN4fR.jpg";
				}
				else{
					img = res.data().image;
				}
			}
			else{
				if((/@/).test(element)){
					flag = true;
					firebase.storage().ref("userImage/"+element).getDownloadURL().then(url =>{
						img =  url;
						newElement(img,res,checked,reg,element);
					});
				}else{
					img = res.data().image;
				}
			}




			if(!flag){
				checkBoxID.push(element);

				var newEle = `

				<div style="box-shadow: 1px 5px 5px rgba(0,0,0,0.5);height:80px;width:100%;margin:20px auto;background-color: white;border-right: 10px;position: relative;">
				<img src="${img}"  style="margin:0;vertical-align: middle;height: 50%;margin-top:17px;margin-left: 30px;" alt="">
				<h4 style="position:absolute;top:35%;left:30%;">${res.data().name}</h4>
				<h5 style="position:absolute;top:35%;left:50%;">${res.data().email}</h5>

				<label style="margin-top:28px;margin-left:30px;position: absolute;" class="switch">
				<input type="checkbox" id="${element}" ${checked}>
				<span class="slider"></span>
				</label>
				<h6 id="${element+'Reg'}" style="position:absolute;margin-top:-25px;margin-left:160px;">${reg}</h6>

				<i id="${element+'rent'}" style="position:absolute;top:50%;right:5%;transform: translate(0,-50%);" class="fa fa-chevron-right next" aria-hidden="true"></i>
				</div>


				`


				document.getElementById('userList').innerHTML += newEle; 
			}
		})
	});




}

function newElement(img,res,checked,reg,element) {

	checkBoxID.push(element);
	var newEle = `

	<div style="box-shadow: 1px 5px 5px rgba(0,0,0,0.5);height:80px;width:100%;margin:20px auto;background-color: white;border-right: 10px;position: relative;">
	<img src="${img}"  style="margin:0;vertical-align: middle;height: 50%;margin-top:17px;margin-left: 30px;" alt="">
	<h4 style="position:absolute;top:35%;left:30%;">${res.data().name}</h4>
	<h5 style="position:absolute;top:35%;left:50%;">${res.data().email}</h5>

	<label style="margin-top:28px;margin-left:30px;position: absolute;" class="switch">
	<input type="checkbox" id="${element}"  ${checked}>
	<span class="slider"></span>
	</label>
	<h6 id="${element+'Reg'}" style="position:absolute;margin-top:-25px;margin-left:160px;">${reg}</h6>

	<i id="${element+'rent'}" style="position:absolute;top:50%;right:5%;transform: translate(0,-50%);" class="fa fa-chevron-right next" aria-hidden="true"></i>
	</div>


	`
	document.getElementById('userList').innerHTML += newEle;
}



var clickedBox;

window.onclick = function(e){
	if(e.target == modal){
		modal.style.display = "none";
		document.getElementById(clickedBox).checked = false;
	}

	if(e.target.id === 'close_modal'){
		document.getElementById(clickedBox).checked = false;
	}


	if(checkBoxID.indexOf(e.target.id)!==-1)
	{
		if(document.getElementById(e.target.id).checked){
			clickedBox = e.target.id ;
			document.getElementById('modal-btn').click();
			console.log('now checked');

		}
		else{
			clickedBox = e.target.id ;

			firebase.firestore().collection('registeredUser').doc(clickedBox).delete().then( ()=>{
				console.log('Deleted')
				document.getElementById(clickedBox+'Reg').textContent ="Unregistered";
			})

			console.log('now unchecked')

		}
	}

	if(e.target.id === 'submit_user'){
		var myFirebaseFirestoreTimestampFromDate = firebase.firestore.Timestamp.fromDate(new Date());

		firebase.firestore().collection('registeredUser').doc(clickedBox).set(
		{ 
			ownerId: document.getElementById('ownerId').value,
			propertyId: document.getElementById('propId').value,
			registered: true,
			seconds: myFirebaseFirestoreTimestampFromDate.seconds

		},
		{
			merge: true
		})

		setTimeout(function(){
			modal.style.display = "none";
			document.getElementById(clickedBox).checked = true;
			document.getElementById(clickedBox+'Reg').textContent ="Registered";

			clickedBox = null;
		},800)
	}

	if(e.target.classList[2] === 'next'){
		document.getElementById('rent_div').style.display = 'block';
		document.getElementById('userDiv').style.display= 'none';
		document.getElementById('back_btn').style.display = 'block';
	}








}


function showRequests(){
	document.getElementById('request_btn').style.backgroundColor = 'white';
	document.getElementById('users_btn').style.backgroundColor = 'rgba(0,0,0,0.2)';

	

}

let modalBtn = document.getElementById("modal-btn")
let modal = document.querySelector(".modal")
let closeBtn = document.querySelector(".close-btn")
modalBtn.onclick = function(){
	modal.style.display = "block"
}
closeBtn.onclick = function(){
	modal.style.display = "none"
}


// get all owners id
firebase.firestore().collection('ownerProfile').get().then( res =>{
	res.forEach( function(docs) {
		var newEle = `
			<option value="${docs.id}">${docs.id}</option>
		`
		document.getElementById('ownerId').innerHTML += newEle;
	});
})

// geyt all properties id
firebase.firestore().collection('properties').get().then( res =>{
	res.forEach( function(docs) {
		var newEle = `
			<option value="${docs.id}">${docs.id}</option>
		`
		document.getElementById('propId').innerHTML += newEle;
	});
})

