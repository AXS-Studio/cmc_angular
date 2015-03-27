<div class="container-fluid header grey-bg text-center">
 <h1> MHT </h1>
</div>

<div class="container col-xs-12 col-sm-8 col-lg-6 center-block" style="float: none;">
<form class="form-signin" name="formLogin" novalidate ng-submit="signIn(formData)">

  <label for="inputEmail" class="sr-only">Email address</label>
  <input type="email" id="inputEmail" class="form-control" placeholder="Email address" required autofocus ng-model="formData.inputEmail" style="margin-bottom: 10px;">
  
  <label for="inputPassword" class="sr-only">Password</label>
  <input type="password" id="inputPassword" class="form-control" placeholder="Password" required ng-model="formData.inputPassword" style="margin-bottom: 10px;">
  
  <div class="row">
    <button class="btn pull-left" type="submit" ng-disabled="formLogin.$invalid" ng-dblclick="">Sign in</button>

    <div class="checkbox pull-right">
      <label>
        <input type="checkbox" value="remember-me" ng-model="formData.inputRemember"> Remember me
      </label>
    </div>

  </div>
</form>
  
<div class="row loginError text-center">{{loginError}}</div>
 
<!-- <pre>
    {{ formData }}
</pre> -->

</div> <!-- /container -->
