# wikiki.github.io


## Laravel integration
1. add "laravelcollective/html": "5.*" to composer.json then run "composer update"

2. in app.php: add this provider: Collective\Html\HtmlServiceProvider::class,

3. then these aliases:
     'HTML' => Collective\Html\HtmlFacade::class,
     'Form' => Collective\Html\FormFacade::class

4. in webpack.mix.js update the mix command to:
     mix.js('resources/assets/js/app.js', 'public/js')
            .sass('resources/assets/sass/app.scss', 'public/css')
            .copy('node_modules/bulma-carousel/dist/bulma-carousel.js', 'public/js');

5. in your view (welcome.blade.php) add the following at the end:
     {!! HTML::script('js/bulma-carousel.js') !!}
        <script>
        var carousels = bulmaCarousel.attach();
        </script>