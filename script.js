var checkBoxID = []; //id of all users checkbox to set registered or unregistered 
var arrID = []; // all users id;

//show all users 
async function showUsers(){

	document.getElementById('users_btn').style.backgroundColor = 'white';
	document.getElementById('request_btn').style.backgroundColor = 'rgba(0,0,0,0.2)';
	document.getElementById('userList').innerHTML = "";
	document.getElementById('userList').style.display = 'block';
	document.getElementById('requestDiv').style.display = 'none';


	arrID = [];  

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

		// getting users images 
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
						newElement(img,res,checked,reg,element); // this function is requried because we are fetching image from storage
					});                                          // this take much time to fetch
				}else{
					img = res.data().image;
				}
			}




			if(!flag){   // this flage we need to create new element if we got images from user_profile or gmail loggin
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
				
				<h6 id="${element+'due'}" style="visibility: hidden; position:absolute;top:50%;right:9%;transform:translate(0,-50%);color:red;">Due Amount:₹ </h6>

				</div>



				`


				document.getElementById('userList').innerHTML += newEle; 
			}
		})
	});




}

function newElement(img,res,checked,reg,element) {  //this is to fetch image from storage

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
	
	<h6 id="${element+'due'}" style="visibility: hidden; position:absolute;top:50%;right:9%;transform:translate(0,-50%);color:red;">Due Amount:₹ </h6>

	</div>


	`
	document.getElementById('userList').innerHTML += newEle;
}



var clickedBox; // this is keep track of clicked box id at user page

window.onclick = async function(e){
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

	if(e.target.id === 'submit_user'){  // registering user
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

	if(e.target.classList[2] === 'next'){  // get id of paid id doc

		document.getElementById('paidData').innerHTML = ""

		document.getElementById('amountfill').innerHTML = `
		<input style="padding-left: 5px;" id="amountPaid" type="text" placeholder="Enter Amount">
		<br><br>
		<select id="paymedium" >
		<option value="cash">Cash</option>
		<option value="online">Digital</option>
		</select>
		<br><br>
		<button type="" onclick="payRent()" class="btn btn-danger">Submit</button></td>

		`

		clickedBox = e.target.id.toString().substring(0,e.target.id.length - 4);

		document.getElementById('rent_div').style.display = 'block';
		document.getElementById('userDiv').style.display= 'none';
		document.getElementById('back_btn').style.display = 'block';
		var rentArr = [];
		var arrMonth = ['JAN','FEB' ,'MAR' ,'APR' , 'MAY' , 'JUN' , 'JUL' , 'AUG', 'SEP' , 'OCT' , 'NOV' , 'DEC'];
		var temp = 0;
		

		firebase.firestore().collection('rentPaid').doc(e.target.id.toString().substring(0,e.target.id.length - 4)).get().then(res =>{
			(res.data().paid).forEach( (ele) => {

				var x = {
							sec: ele.date.seconds, //second of timestamp
							amount: ele.amount,
							total: ele.total,
							vn: ele.vn,
							date: ele.date.toDate().toString().substring(0,10),
							month:  ele.month
						}
						rentArr.push(x);

					});

			rentArr.sort(function(a,b){ return Number(b.sec) - Number(a.sec)});
			rentArr.forEach((element, index) => {

				if(element.date.charAt(9)=='1')
					element.date += "st";
				else if(element.date.charAt(9)=='2')
					element.date += "nd";
				else if(element.date.charAt(9)=='3')
					element.date += "rd";
				else
					element.date += "th";

				var newEle =`
				<div style="width:95%;height:105px;background-color:white;border-radius:0px;border:1px solid #ddd;box-shadow:0px 2px 5px rgba(0,0,0,0.6);margin:12px auto;position:relative;">
				<div style="border-left: 2px solid rgb(219, 219, 219);height:53px;position:absolute;top:50%;margin-left:30px;transform:translate(0%,-50%)"></div>

				<span style="color:black; font-size:13px; width:100%; height:24px; background:rgb(211, 211, 211); display:block;box-shadow:0px 2px 2px rgba(0,0,0,0.7);"><span style="margin-left:12px;font-family:Montserrat;font-weight:600;font-size:15px;">Invoice No.: </span><span style="color:#3fb6c6;font-family:Montserrat;font-weight:600;font-size:15px;">${element.vn}</span></span> 
				<h6 style="margin-left:40px;margin-top:14px;font-family:Montserrat;font-weight:700"><i class="fa fa-circle-o" aria-hidden="true" style="position:absolute;margin-left:-16px;color:#3fb6c6;background-color:white;"></i>Rent ${element.month} <span style="float:right;margin-right:10px;"> ₹ ${element.amount}</span></h6>
				<p style="margin-top:-7px;margin-left:40px;font-size:13px;position:relative;"><span style="font-family:Montserrat;"> Paid on ${element.date}</span></p>
				<hr style="margin-top:-13px;margin-bottom:0;">
				<p style="margin-left:15px;font-family:Montserrat;font-weight:600;font-size:15px;">Total: ₹ ${element.total}<span style="float:right;margin-right:10px;">VIEW INVOICE</span></p>
				</div>
				`
				temp++;
				document.getElementById('paidData').innerHTML += newEle;
				if(temp==1)
					document.getElementById('payRent').textContent = arrMonth[arrMonth.indexOf(element.month)] + " Rent Paid";
				
				
			});

		});


		document.getElementsByClassName('modal')[0].innerHTML = `


		<div class="modal-content" style="z-index: 1000 !important; max-width:300px;">
		<span onclick = "document.querySelector('.modal').style.display = 'none'" style="cursor: pointer;font-weight:700;">&times;</span>
		<form onsubmit="return false">
		<p style="margin-bottom: 5px;">Total Due</p>
		<input style="border:1px solid green;width:75%;height:36px;padding-left: 5px" id="amtDue" type="number" required name="" >

		<br>
		<p  style="margin-bottom: 5px;">Last Date</p>
		<input style="border:1px solid green;width:75%;height:36px;padding-left: 5px" id="lastDueDate" required type="date" name="">
		<br>
		<br>
		<div id="btn-div">
		<button  class="btn btn-danger" onclick="submitDue()" type="submit" >Submit</button>
		</div>
		</form>
		</div>


		`

		
	}


	// to show maintentance image
	if(slNumber.indexOf(e.target.id.substring(0,e.target.id.length-5))!==-1)
	{
		var id = e.target.id.substring(0,e.target.id.length-5);

		firebase.storage().ref("userMaintenanceImage/"+id).getDownloadURL().then(url =>{
			window.open(url)
		}).catch(err=>{
			console.log(err)
		})
	}



	// to show maintentance toggle solved btn
	if(slNumber.indexOf(e.target.id)!==-1)
	{

		if(document.getElementById(e.target.id).checked){

			var id = e.target.id;
			var docid ="";

			await firebase.firestore().collection('userMaintenance').where("sl",'==',id).get().then(res=>{
				console.log(res.docs[0].id);
				docid =  res.docs[0].id
			})

			await firebase.firestore().collection('userMaintenance').doc(docid).update({
				solved : true
			})

			

			console.log('now checked');

		}
		else{

			var id = e.target.id;
			var docid ="";

			await firebase.firestore().collection('userMaintenance').where("sl",'==',id).get().then(res=>{
				console.log(res.docs[0].id);
				docid = res.docs[0].id;

			})

			await firebase.firestore().collection('userMaintenance').doc(docid).update({
				solved: false
			})

			console.log('now unchecked')

		}

	}

	// to show left options in exit users
	if(arrID.indexOf(e.target.id.replace("check",""))!==-1)
	{
		console.log('hi')
		if(document.getElementById(e.target.id).checked){
			document.getElementById(e.target.id.replace("check","span")).style.display = 'initial';
			console.log('now checked');

		}else{
			document.getElementById(e.target.id.replace("check","span")).style.display = 'none';
			firebase.firestore().collection('exitRequest').doc(e.target.id.replace("check","")).update({
				leftDate:firebase.firestore.FieldValue.delete()
			});
			console.log('now unchecked')

		}
	}








}


async function submitDue(){  //update submit amount

	if(document.getElementById('amtDue').value==="" && document.getElementById('lastDueDate').value==="" ){
		alert('Invalid Entry')
		return;
	}

	var myFirebaseFirestoreTimestampFromDate = firebase.firestore.Timestamp.fromDate(new Date(document.getElementById('lastDueDate').value.toString()));
	let lastDate = myFirebaseFirestoreTimestampFromDate.toDate()
	let name = "";

	await firebase.firestore().collection('userProfile').doc(clickedBox).get().then( res =>{
		name = res.data().name;
	})


	firebase.firestore().collection('rentDue').doc(clickedBox).get().then(res =>{
		if(res.exists)
		{
			firebase.firestore().collection('rentDue').doc(clickedBox).update({
				due:firebase.firestore.FieldValue.arrayUnion({
					amount:document.getElementById('amtDue').value,
					total:document.getElementById('amtDue').value,
					month: lastDate.toString().substring(4, 7),
					lastDate: lastDate,
					name:name,
					total:document.getElementById('amtDue').value
				})
			})
			firebase.firestore().collection('rentDue').doc(clickedBox).update({
				total:document.getElementById('amtDue').value
			})
			

		}else{
			firebase.firestore().collection('rentDue').doc(clickedBox).set({
				due:firebase.firestore.FieldValue.arrayUnion({
					amount:document.getElementById('amtDue').value,
					total:document.getElementById('amtDue').value,
					month: lastDate.toString().substring(4,7),
					lastDate: lastDate,
					name:name,
					total:document.getElementById('amtDue').value
				})
			})

			firebase.firestore().collection('rentDue').doc(clickedBox).set({
				total:document.getElementById('amtDue').value
			})


			
		}

		document.getElementById('btn-div').innerHTML =`

		<h5>DONE!</h5>

		`

	})




}


function back(){
	document.getElementById('rent_div').style.display = 'none';
	document.getElementById('userDiv').style.display = 'block';
	document.getElementsByClassName('modal')[0].innerHTML =`

	<div class="modal-content" style="z-index: 1000 !important;">
	<span class="close-btn" id="close_modal" style="cursor: pointer;">&times;</span>
	<form onsubmit="return false">
	<p style="margin-bottom: 5px;">Owner ID</p>
	<select id="ownerId" style="border:1px solid green;width:75%;height:36px;padding-left: 5px" required>
	<!-- data from db -->
	</select>

	<br>
	<p  style="margin-bottom: 5px;">Property ID</p>
	<select id="propId" style="border:1px solid green;width:75%;height:36px;padding-left: 5px" required>
	<!-- data from db -->
	</select>
	<br>
	<br>
	<button class="btn btn-danger" type="submit" id="submit_user">Submit</button>
	</form>
	</div>

	`

	firebase.firestore().collection('rentDue').doc(clickedBox).get().then(res =>{
		if(res.exists){
			document.getElementById(clickedBox+'due').textContent = 'Due Amount: ₹ ' + res.data().total;
			document.getElementById(clickedBox+'due').style.visibility = 'visible';
		}
		else{
			document.getElementById(clickedBox+'due').textContent = 'No Dues '
			document.getElementById(clickedBox+'due').style.visibility = 'visible';
		}
	})


}

function fillAmount(){
	document.getElementById('amountfill').style.display = 'block';
	document.getElementById('payRent').disabled = true;
}

function payRent(){

	if(document.getElementById('amountPaid').value===""){
		alert('Enter Amount')
		return;
	}

	var myFirebaseFirestoreTimestampFromDate = firebase.firestore.Timestamp.fromDate(new Date());
	firebase.firestore().collection('rentPaid').doc(clickedBox).get().then(res =>{
		if(res.exists)
		{
			firebase.firestore().collection('rentPaid').doc(clickedBox).update({
				paid:firebase.firestore.FieldValue.arrayUnion({
					amount:document.getElementById('amountPaid').value,
					total:document.getElementById('amountPaid').value,
					vn:"RLLVNSO"+ Math.floor(Math.random()*10000000).toString(),
					date: firebase.firestore.Timestamp.fromDate(new Date()),
					mode: document.getElementById('paymedium').value,
					month: myFirebaseFirestoreTimestampFromDate.toDate().toString().substring(4,7).toUpperCase()

				})
			})
			console.log('Done')

		}else{
			firebase.firestore().collection('rentPaid').doc(clickedBox).set({

				paid:firebase.firestore.FieldValue.arrayUnion({
					amount:document.getElementById('amountPaid').value,
					total:document.getElementById('amountPaid').value,
					vn:"RLLVNSO"+ Math.floor(Math.random()*10000000).toString(),
					date: firebase.firestore.Timestamp.fromDate(new Date()),
					mode:document.getElementById('paymedium').value,
					month: myFirebaseFirestoreTimestampFromDate.toDate().toString().substring(4,7).toUpperCase()
				})
			})

			console.log('Done')
		}

		document.getElementById('amountfill').innerHTML = `
		<input style="padding-left: 5px;" id="amountPaid" type="text" placeholder="Enter Amount">
		<br><br>
		<select id="paymedium" >
		<option value="cash">Cash</option>
		<option value="online">Digital</option>
		</select>
		<br><br>
		<h5>DONE!</h5></td>

		`
	})
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



function showRequests(){
	document.getElementById('request_btn').style.backgroundColor = 'white';
	document.getElementById('users_btn').style.backgroundColor = 'rgba(0,0,0,0.2)';

	document.getElementById('userList').style.display = 'none';
	document.getElementById('requestDiv').style.display = 'block';
	document.getElementById('back_btn').style.display ='none';
	fetchData();
}





var arrSolved = [];
var arrUnsolved = [];
var slNumber = [];

async function fetchData(){  // fetch data of maintanance

	document.getElementById('status_div').innerHTML = ``;
	document.getElementById('status_div').style.display = 'block';
	document.getElementById('exitRequest').style.display = 'none';
	document.getElementById('mainta_btn').style.backgroundColor = 'white'
	document.getElementById('exit_req_btn').style.backgroundColor = 'rgba(0,0,0,0.2)'
	slNumber = []
	arrUnsolved = []
	arrSolved = []
	
	var arrIds = []; // id of all maintan requests

	for(let i = 0;i<arrID.length ;i++ ){
		await firebase.firestore().collection('userRequests').doc(arrID[i]).get().then(res =>{
			if(res.exists){
				res.data().id.forEach( function(element) {
					arrIds.push(element);
				});
				
			}

		}).catch(err =>{

		})
	}

	


	for(let i =0;i<arrIds.length ;i++){
		await firebase.firestore().collection('userMaintenance').doc(arrIds[i]).get().then(res =>{
			var x = {
				sec:res.data().date.seconds,
				service:res.data().service,
				sl:res.data().sl,
				date:res.data().date.toDate().toString().substring(0,10),
				solved : res.data().solved,
				issue: res.data().issue,
				visitDate :res.data().visitDate,
				visitTime : res.data().visitTime,
				des :res.data().description,
				photo: res.data().photo
			}

			if(res.data().solved){
				arrSolved.push(x)

			}else{

				arrUnsolved.push(x)	
			}

		})
	}


	arrUnsolved.sort(function(a,b){ return Number(b.sec) - Number(a.sec)});

	Array.from(arrUnsolved).forEach(function(element, index) {
		if(element.date.charAt(9)=='1')
			element.date += "st";
		else if(element.date.charAt(9)=='2')
			element.date += "nd";
		else if(element.date.charAt(9)=='3')
			element.date += "rd";
		else
			element.date += "th";

		var checked ="";
		var color ='color:black'

		if(element.solved){
			checked = "checked";
			color = 'color:green';
		}
		else{
			checked = " ";
			color = 'color:red';

		}


		var newEle =`
		<div data-aos="fade-up"  data-aos-offset="120"style="width:95%;height:100%;background-color:white;border-radius:3px;border:1px solid #ddd;box-shadow:0px 2px 5px rgba(0,0,0,0.6);margin:12px auto;padding-top:7px;">
		<span style="color:grey;font-size:13px;margin-left:20px;margin-top:10px;">${element.sl}</span> <span style="float:right;margin-right:20px;color:grey;font-size:13px;margin-top:0px;">${element.date}</span>
		<h6 style="margin-left:20px;margin-top:7px;font-family:Montserrat;font-weight:700">${element.service}</h6>
		<p style="margin-top:-5px;margin-left:20px;font-size:13px;font-weight:400">${element.issue}</p>
		<p style="margin-top:-5px;margin-left:20px;font-size:12px;font-weight:400">${element.des}</p>
		<span style="margin-top:-5px;margin-right:20px;font-size:12px;font-weight:400;float:right;">Visit Date: ${element.visitDate}</span><span style="margin-top:-5px;margin-left:20px;font-size:12px;font-weight:400;float:right;padding-right:15px;">Visit Time: ${element.visitTime}</span>
		<p style="margin-top:-5px;padding-left:20px;font-size:13px;font-weight:700"><span style=${color} > Service on progress</span></p>
		<i id="${element.sl}Photo" style="margin-right:20px;font-size:20px;float:right;" class="fa fa-eye" aria-hidden="true"></i>
		<label style="margin-top:5px;margin-left:20px;" class="switch">
		<input type="checkbox" id="${element.sl}" ${checked} >
		<span class="slider"></span>
		</label>
		</div>
		

		`
		document.getElementById('status_div').innerHTML += newEle

		slNumber.push(element.sl)  // all serial number array 

	});



	arrSolved.sort(function(a,b){ return Number(b.sec) - Number(a.sec)});
	Array.from(arrSolved).forEach(function(element, index) {

		if(element.date.charAt(9)=='1')
			element.date += "st";
		else if(element.date.charAt(9)=='2')
			element.date += "nd";
		else if(element.date.charAt(9)=='3')
			element.date += "rd";
		else(element.date.charAt(9)=='0')
			element.date += "th";

		var checked ="";
		var color ='color:black'

		if(element.solved){
			checked = "checked";
			color = 'color:green';
		}
		else{
			checked = " ";
			color = 'color:red';

		}


		var newEle =`
		<div data-aos="fade-up"  data-aos-offset="120"style="width:95%;height:100%;background-color:white;border-radius:3px;border:1px solid #ddd;box-shadow:0px 2px 5px rgba(0,0,0,0.6);margin:12px auto;padding-top:7px;">
		<span style="color:grey;font-size:13px;margin-left:20px;margin-top:10px;">${element.sl}</span> <span style="float:right;margin-right:20px;color:grey;font-size:13px;margin-top:0px;">${element.date}</span>
		<h6 style="margin-left:20px;margin-top:7px;font-family:Montserrat;font-weight:700">${element.service}</h6>
		<p style="margin-top:-5px;margin-left:20px;font-size:13px;font-weight:400">${element.issue}</p>
		<p style="margin-top:-5px;margin-left:20px;font-size:12px;font-weight:400">${element.des}</p>
		<span style="margin-top:-5px;margin-right:20px;font-size:12px;font-weight:400;float:right;">Visit Date: ${element.visitDate}</span><span style="margin-top:-5px;margin-left:20px;font-size:12px;font-weight:400;float:right;padding-right:15px;">Visit Time: ${element.visitTime}</span>
		<p style="margin-top:-5px;padding-left:20px;font-size:13px;font-weight:700"><span style=${color} > Done!</span></p>
		<i id="${element.sl}Photo" style="margin-right:20px;font-size:20px;float:right;" class="fa fa-eye" aria-hidden="true"></i>
		<label style="margin-top:5px;margin-left:20px;" class="switch">
		<input type="checkbox" id="${element.sl}" ${checked} >
		<span class="slider"></span>
		</label>
		</div>
		

		`
		document.getElementById('status_div').innerHTML += newEle

		slNumber.push(element.sl)
	});


}

async function showExitRequests(){ // exit requests
	document.getElementById('exitRequest').innerHTML =""; 
	document.getElementById('status_div').style.display = 'none';
	document.getElementById('exitRequest').style.display = 'block';
	document.getElementById('mainta_btn').style.backgroundColor = 'rgba(0,0,0,0.2)'
	document.getElementById('exit_req_btn').style.backgroundColor = 'white'

	var exitReqID = [];
	var exitData =[];
	document.getElementById('status_div').style.display ='none';
	document.getElementById('exitRequest').style.display ='block';

	await firebase.firestore().collection('exitRequest').get().then(res =>{
		res.docs.forEach( function(element, index) {
			exitReqID.push(element.id);
		});
	})

	for(let i =0 ;i< exitReqID.length;i++){
		await firebase.firestore().collection('exitRequest').doc(exitReqID[i]).get().then(res =>{
			exitData.push(res.data())
		})
	}

	exitData.sort(function(a,b){ return Number(b.requestedDate.seconds) - Number(a.requestedDate.seconds)});
	console.log(exitData)

	exitData.forEach( async function(element, index) {
		var name, secondStayed;
		await firebase.firestore().collection('userProfile').doc(element.uid).get().then(res =>{
			name = res.data().name;
		});

		await  firebase.firestore().collection('registeredUser').doc(element.uid).get().then(res =>{
			secondStayed = res.data().seconds;
		});


		var checked;
		if(element.exit){
			checked='checked'
		}
		else{
			checked=""
		}

		var myFirebaseFirestoreTimestampFromDate = firebase.firestore.Timestamp.fromDate(new Date());
		var diff = myFirebaseFirestoreTimestampFromDate.seconds - secondStayed

		var min = diff/60;
		var hours = min/60;
		var days = hours/24;

		var stay = days.toString().substring(0,3);  

		var newEle =`

		<div  style="margin:20px auto;margin-top:80px;margin-bottom:50px;border:1px solid black;height:300px;width:95%;opacity:1; background: white;box-shadow: 1px 3px 5px rgba(0,0,0,0.8);border-radius:5px;">
		<h5 style="font-size:15px !important;font-family:Montserrat;margin:8px auto;text-align:center;color:black;font-weight: 700;">${name} (${element.uid}) is planing to Leave</h5>
		<h5 style="font-size:15px !important;font-family:Montserrat;margin:8px auto;text-align:center;color:black;font-weight: 700;">Property ID: ${element.propertyId}</h5>
		<h5 style="font-size:15px !important;font-family:Montserrat;margin:8px auto;text-align:center;color:black;font-weight: 700;">Requested on: ${element.requestedDate.toDate()}</h5>
		<h5 style="font-size:15px !important;font-family:Montserrat;margin:8px auto;text-align:center;color:black;font-weight: 700;">Stayed for  ${stay} Days</h5>

		<ul style="padding:0;margin:0px auto; width:100%;  display: flex; justify-content: space-between;font-family:Montserrat;">
		<li style="list-style:none;display:block;margin-left:10px;">
		<div id=${element.uid}seven  style="margin:0px auto;margin-top:10px;margin-bottom:20px;border:1px solid black;height:100px;width:100px;position:relative;">
		<span id=${element.uid}s-seven style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);width:100px;">
		<span style="margin:0 auto; text-align:center; display:block; font-size:13px;  margin-left:-10px;">With in</span>
		<span style="margin:0 auto;text-align:center;display:block;font-weight:700;">7 Days</span>
		</span>
		</div>
		</li>
		<li  style="list-style:none;display:block;">
		<div id=${element.uid}fifteen style="margin:0px auto;margin-top:10px;margin-bottom:20px;border:1px solid black;height:100px;width:100px;position:relative;">
		<span id=${element.uid}s-fifteen  style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);width:100px;">
		<span style="margin:0 auto; text-align:center; display:block; font-size:13px;  margin-left:-10px;">With in</span>
		<span style="margin:0 auto;text-align:center;display:block;font-weight:700;">15 Days</span>
		</span>
		</div>
		</li>
		<li  style="list-style:none;display:block;margin-right:20px;">
		<div id=${element.uid}month  style="margin:0px auto;margin-top:10px;margin-bottom:20px;border:1px solid black;height:100px;width:100px;position:relative;">
		<span id=${element.uid}s-month style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);width:100px;">
		<span style="margin:0 auto; text-align:center; display:block; font-size:13px;  margin-left:-10px;">With in</span>
		<span style="margin:0 auto;text-align:center;display:block;font-weight:700;">1 Month</span>
		</span>
		</div>
		</li>
		</ul>
		<span id=${element.uid}span >
		<input id=${element.uid}DateLeft  style="margin-left: 10px;margin-right:20px;" type="date" name="">
		<button type="submit" onclick="submitLeftDate('${element.uid}')" class="btn btn-danger">Submit</button>
		</span>
		<label style="margin-top:5px;margin-left:20px;" class="switch">
		<input id="${element.uid}check"  type="checkbox" ${checked} >
		<span class="slider"></span>
		</label>
		<span id=${element.uid}left style="color:green;font-weight:700;"> Left on : </span>

		</div>

		`

		

		document.getElementById('exitRequest').innerHTML += newEle;

		if(element.exit){
			document.getElementById(element.uid+"span").style.display = 'none'
			document.getElementById(element.uid+"check").checked = true;
			document.getElementById(element.uid+"left").display = 'initial'
			document.getElementById(element.uid+"left").textContent ="Left on " + element.leftDate.toString();

		}else{
			document.getElementById(element.uid+"span").style.display = 'none'
			document.getElementById(element.uid+"check").checked = false;
			document.getElementById(element.uid+"left").display = 'none'
			document.getElementById(element.uid+"left").textContent ="Not Left Yet" 
			document.getElementById(element.uid+"left").style.color = "red";
		}


		if(element.withIn === '7 days')
			setDays('7',element.uid);
		if(element.withIn === '15 days')
			setDays('15',element.uid);
		if(element.withIn === '30 days')
			setDays('30',element.uid);


	});






}

async function submitLeftDate(id){  //submitting left date

	console.log(document.getElementById(id+"DateLeft").value);
	if(document.getElementById(id+"DateLeft").value=="")
	{
		alert("Invalid Input")
		return;
	}

	await firebase.firestore().collection('exitRequest').doc(id).update({
		leftDate: document.getElementById(id+"DateLeft").value
	})
	await firebase.firestore().collection('exitRequest').doc(id).update({
		exit: true
	});

	document.getElementById(id+"span").innerHTML=`

	<input id=${id}DateLeft  style="margin-left: 10px;margin-right:20px;" type="date" name="">
	DONE!
	`

}

function setDays(days,id){ // ui related stuff for exit div days

	if(days === '7'){
		document.getElementById(id+'seven').style.background = '#3fb6c6'
		document.getElementById(id+'s-seven').style.color = "white";


		document.getElementById(id+'fifteen').style.background = 'none'
		document.getElementById(id+'s-fifteen').style.color = "black";
		document.getElementById(id+'month').style.background = 'none'
		document.getElementById(id+'s-month').style.color = "black";
	}
	else if(days === '15'){

		document.getElementById(id+'fifteen').style.background = '#3fb6c6'
		document.getElementById(id+'s-fifteen').style.color = "white";

		document.getElementById(id+'seven').style.background = 'none'
		document.getElementById(id+'s-seven').style.color = "black";
		document.getElementById(id+'month').style.background = 'none'
		document.getElementById(id+'s-month').style.color = "black";
	}
	else if(days === '30'){

		document.getElementById(id+'month').style.background = '#3fb6c6'
		document.getElementById(id+'s-month').style.color = "white";

		document.getElementById(id+'seven').style.background = 'none'
		document.getElementById(id+'s-seven').style.color = "black";
		document.getElementById(id+'fifteen').style.background = 'none'
		document.getElementById(id+'s-fifteen').style.color = "black";
	}

}