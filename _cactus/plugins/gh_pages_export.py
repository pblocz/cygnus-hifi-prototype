import os
import logging

from distutils.dir_util import copy_tree

logger = logging.getLogger(__name__)

BUILD_DIR = ".build/"
EXPORT_DIR = "../"


def postBuild(site):

    build = os.path.join(site.path,BUILD_DIR)
    export = os.path.abspath(os.path.join(site.path,EXPORT_DIR))

    if site.config.get('export',False):
        logger.info("exporting {0} -> {1}".format(build,export))
        copy_tree(build, export)
