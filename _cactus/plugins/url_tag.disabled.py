#coding:utf-8
import os
import logging

from django.conf import settings
from django.utils.encoding import smart_str, force_unicode
from django.utils.safestring import mark_safe


from cactus.template_tags import register

logger = logging.getLogger(__name__)


def url(context, link_url):
    """
    Get the path for a page in the Cactus build.
    We'll need this because paths can be rewritten with prettifying.
    """
    site = context['__CACTUS_SITE__']
    page = context['__CACTUS_CURRENT_PAGE__']

    url = "{0}{1}".format(site.url or "",site.get_url_for_page(link_url))
    print url
    if url is None:

        # See if we're trying to link to an /subdir/index.html with /subdir
        link_url_index = os.path.join(link_url, "index.html")
        url_link_url_index = site.get_url_for_page(link_url_index)

        if url_link_url_index is None:
            logger.warn('%s: page resource does not exist: %s', page.link_url, link_url)
        
        url = link_url

    if site.prettify_urls:
        return url.rsplit('index.html', 1)[0]


    return url


register.simple_tag(takes_context=True)(url)
