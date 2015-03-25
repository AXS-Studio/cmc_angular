<div class="container-fluid header grey-bg text-center">

 <h1> MHT </h1>

</div>

<div class="container col-xs-12 col-sm-8 col-lg-6 center-block" style="float: none;">
<form class="form-signin"  novalidate ng-submit="signIn()">

  <label for="inputEmail" class="sr-only">Email address</label>
  <input type="email" id="inputEmail" class="form-control" placeholder="Email address" autofocus ng-model="formData.inputEmail" style="margin-bottom: 10px;">
  
  <label for="inputPassword" class="sr-only">Password</label>
  <input type="password" id="inputPassword" class="form-control" placeholder="Password"  ng-model="formData.inputPassword" style="margin-bottom: 10px;">
  
  <row> 
  <button class="btn btn-default pull-left" type="submit">Sign in</button>
  <div class="checkbox pull-right">
    <label>
      <input type="checkbox" value="remember-me"> Remember me
    </label>
  </div>
  </row>
</form>

<!-- <pre>
    {{ formData }}
</pre> -->

</div> <!-- /container -->
