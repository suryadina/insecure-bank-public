#!/usr/bin/env bash
set -Eeuo pipefail

# Kick off the official WordPress entrypoint, which copies WordPress core
# into /var/www/html (first boot only), writes wp-config.php from the
# WORDPRESS_* env vars, and finally execs apache2-foreground.
/usr/local/bin/docker-entrypoint.sh apache2-foreground &
APACHE_PID=$!

WP="wp --path=/var/www/html --allow-root"

# Wait for wp-config.php to be written by the official entrypoint.
for i in $(seq 1 60); do
    [ -f /var/www/html/wp-config.php ] && break
    sleep 1
done

# Wait for the database to accept connections.
for i in $(seq 1 60); do
    $WP db check >/dev/null 2>&1 && break
    sleep 2
done

if ! $WP core is-installed >/dev/null 2>&1; then
    $WP core install \
        --url="${WORDPRESS_SITE_URL:-http://localhost/blog}" \
        --title="Insecure Bank Corporate Blog" \
        --admin_user="${WORDPRESS_ADMIN_USER:-admin}" \
        --admin_password="${WORDPRESS_ADMIN_PASSWORD:?WORDPRESS_ADMIN_PASSWORD must be set}" \
        --admin_email="${WORDPRESS_ADMIN_EMAIL:-admin@insecurebank.local}" \
        --skip-email
fi

# Import the seed blog posts (WXR) on first boot so redeploys keep the blog content.
# Skip if posts already exist (e.g. after a container restart where the DB survived).
# Wait for the official entrypoint's background copy to finish (it brings seed-posts.xml).
for i in $(seq 1 30); do
    [ -f /var/www/html/seed-posts.xml ] && break
    sleep 2
done

POST_COUNT="$($WP post list --post_type=post --format=count 2>/dev/null || echo 0)"
if [ -f /var/www/html/seed-posts.xml ] && [ "$POST_COUNT" -lt 2 ]; then
    echo "Importing seed blog posts from seed-posts.xml..."
    $WP plugin activate wordpress-importer >/dev/null 2>&1 || true
    $WP import /var/www/html/seed-posts.xml --authors=skip --skip=attachment 2>&1 || echo "⚠️ seed import failed (continuing)"
fi

$WP plugin activate bank-media-uploader || true

# Ensure publisher.bot is the ONLY WordPress user (the original `admin` from the
# baked-in env is removed so the only way into wp-admin is the crackable cred).
# The password admin123 (bcrypt-hashed by WP) is what students crack from the
# staff_accounts dump below. Retry until wp is fully ready.
for i in $(seq 1 10); do
    if $WP user get publisher.bot --field=ID >/dev/null 2>&1; then break; fi
    $WP user create publisher.bot webmaster@insecurebank.local --role=administrator \
        --user_pass=admin123 --porcelain >/dev/null 2>&1 || true
    sleep 3
done
$WP user set-role publisher.bot administrator >/dev/null 2>&1 || true
if $WP user get admin --field=ID >/dev/null 2>&1; then
    $WP user delete admin --yes --reassign=publisher.bot >/dev/null 2>&1 || true
fi

# Seed the staff_accounts table (idempotent) used by the publisher diagnostics
# endpoint. Holds the SAME hash as the wp_users row for publisher.bot, so the
# dumped credential is the live WordPress password hash (crackable: admin123).
# Uses PHP's mysqli directly (the mysql CLI is not present in this image).
for i in $(seq 1 10); do
    if php -r '$c=@new mysqli("wordpress-db","wordpress","WordpressPassword123","wordpress"); if(!$c->connect_error){ $c->query("CREATE TABLE IF NOT EXISTS staff_accounts (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(64) NOT NULL, password_hash VARCHAR(128) NOT NULL, UNIQUE KEY username (username)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"); $c->query("INSERT INTO staff_accounts (username, password_hash) VALUES (\"publisher.bot\", \"\$wp\$2y\$10\$b8iZropwmqa746tZqbuHbOx8qqvmqOjvxftRrGMSbneJzleATDV0.\") ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash)"); }' >/dev/null 2>&1; then
        break
    fi
    sleep 3
done

wait "$APACHE_PID"
