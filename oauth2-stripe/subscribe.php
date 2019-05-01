<?php
session.start();
?><!DOCTYPE html>
<html lang="en">
  <div>
    <p style="color: red">{{ msg }}</p>
  </div>

  <div>
    <h1>TallyPokeMap</h1>
  </div>

  <div>
    <div>
      <h2>Gold Star Status</h2>
      <p>Access to the Live Map and to Discord Pokemon subscriptions.</p>
        <form action="/create_subscription.php" method="POST">
          <script src="https://checkout.stripe.com/checkout.js" class="stripe-button"
                data-key="<?php echo $_SESSION['stripe_pk'];?>"
                data-image="/Discord-OAuth2/static/logo_small.png"
                data-name="TallyPokeMap"
                data-description="Gold Star Trainer Status"
                data-amount="<?php echo $_SESSION['stripe_plan_cost'];?>"
                data-locale="auto"
                data-zip-code="true"
                data-panel-label="Subscribe"
                data-email="<?php echo $_SESSION['user_email'];?>"
                data-label="<?php echo $_SESSION['stripe_plan_cost']/100;?>">
          </script>
        </form>
      </div>

    <br>
    <hr>

    <div>
      <h1>Tip Jar</h1>
      <form class="left">
        <article>
          <label>
            <span>AMOUNT:</span>
          </label>
        </article>
        <input type="text" name="amount">
        <article>
          <label>
            <span>MESSAGE:</span>
          </label>
        </article>
        <input type="text" name="message"><br><br>
        <input type="hidden" name="fp" value="{{ fp }}">
        <input type="submit">
      </form>
    </div>

    <br>
    <hr>

    <div>
      <p>Service can be cancelled at any time by clicking the button below.</p>
      <form action="/delete_subscription.php" method="POST">
        <input type="submit" value="Unsubscribe">
      </form>
    </div>
</html>
