<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * This namespace is applied to your controller routes.
     *
     * In addition, it is set as the URL generator's root namespace.
     *
     * @var string
     */
    protected $namespace = 'App\Http\Controllers';

    /**
     * Define your route model bindings, pattern filters, etc.
     *
     * @return void
     */
    public function boot()
    {
        //

        parent::boot();
    }

    /**
     * Define the routes for the application.
     *
     * @return void
     */
    public function map()
    {
        Route::pattern('path', '.*?');
        Route::pattern('api', 'api');
        Route::pattern('event', 'event');
        Route::pattern('notify', 'notify');
        Route::pattern('notifyDomain', 'notify\..+');
        Route::pattern('apiDomain', 'api\..+');
        Route::pattern('eventDomain', 'event\..+');
        $this->mapEventRoutes();
        $this->mapNotifyRoutes();
        $this->mapApiRoutes();
        $this->mapWebRoutes();
        //
    }

    /**
     * Define the "web" routes for the application.
     *
     * These routes all receive session state, CSRF protection, etc.
     *
     * @return void
     */
    protected function mapWebRoutes()
    {
        Route::group(['middleware' => 'web', 'namespace' => $this->namespace], base_path('routes/web.php'));
    }

    /**
     * Define the "api" routes for the application.
     *
     * These routes are typically stateless.
     *
     * @return void
     */
    protected function mapApiRoutes()
    {
        Route::group(['prefix' => '{api}', 'namespace' => $this->namespace], base_path('routes/api.php'));
        Route::group(['domain' => '{apiDomain}', 'namespace' => $this->namespace], base_path('routes/api.php'));
    }

    /**
     * Define the "notify" routes for the application.
     *
     * These routes are typically stateless.
     *
     * @return void
     */
    protected function mapNotifyRoutes()
    {
        Route::group(['prefix' => '{notify}', 'namespace' => $this->namespace], base_path('routes/notify.php'));
        Route::group(['domain' => '{notifyDomain}', 'namespace' => $this->namespace], base_path('routes/notify.php'));
    }

    protected function mapEventRoutes()
    {
        Route::group(['prefix' => '{event}', 'namespace' => $this->namespace], base_path('routes/event.php'));
        Route::group(['domain' => '{eventDomain}', 'namespace' => $this->namespace], base_path('routes/event.php'));
    }
}
